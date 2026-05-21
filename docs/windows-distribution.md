# Windows 配布と Smart App Control 対応

## 背景

Smart App Control は、Windows 11 のセキュリティ機能として、信頼できると判定できないアプリをブロックする。
moa の Windows 配布物は、Smart App Control を無効化しない前提で配布するため、信頼されたコード署名証明書で署名する。

Microsoft の Smart App Control 向けコード署名ガイドでは、Smart App Control で扱う署名は信頼された CA から発行された RSA コード署名証明書である必要がある。自己署名証明書や ECC 証明書は、Smart App Control 対応の配布手段として採用しない。

## 方針

- Windows 向けの配布物は署名済み artifact として作成する。
- 署名には Microsoft Artifact Signing / Trusted Signing、または信頼された CA の RSA コード署名証明書を使う。
- GitHub Actions では、Tauri の `bundle.windows.signCommand` を使い、Tauri の bundle 処理中に実行ファイルと NSIS インストーラーを署名する。
- 証明書、Azure 認証情報、署名プロファイル名は GitHub Secrets / Variables に置き、リポジトリには保存しない。
- 通常の `just build` と CI は未署名ビルドとして維持し、署名が必要な配布ビルドだけ専用 workflow を使う。

## GitHub Actions 設定

署名付き Windows 配布 workflow は `.github/workflows/release-windows.yml` で管理する。

### 署名情報を用意する

Microsoft Artifact Signing / Trusted Signing を使う場合は、Azure 側で以下を用意する。

1. Azure で Trusted Signing account を作成する。
2. Trusted Signing account に certificate profile を作成する。
3. GitHub Actions から使う Entra ID app registration または service principal を作成する。
4. その app registration に client secret を作成する。
5. app registration に、対象 Trusted Signing account / certificate profile で署名できる権限を付与する。
6. Signing account の endpoint、account name、certificate profile name を控える。

各値は以下で確認する。

| 値 | 確認元 |
| --- | --- |
| `AZURE_TENANT_ID` | Microsoft Entra ID の tenant ID |
| `AZURE_CLIENT_ID` | app registration の application/client ID |
| `AZURE_CLIENT_SECRET` | app registration で作成した client secret の値 |
| `MOA_WINDOWS_SIGNING_ENDPOINT` | Trusted Signing account の endpoint |
| `MOA_WINDOWS_SIGNING_ACCOUNT_NAME` | Trusted Signing account の名前 |
| `MOA_WINDOWS_SIGNING_CERTIFICATE_PROFILE_NAME` | certificate profile の名前 |

client secret は作成直後しか値を確認できないため、作成時に GitHub Secrets へ登録する。

事前に以下を GitHub Secrets に登録する。

| 名前 | 説明 |
| --- | --- |
| `AZURE_TENANT_ID` | Azure tenant ID |
| `AZURE_CLIENT_ID` | Trusted Signing を実行する app registration の client ID |
| `AZURE_CLIENT_SECRET` | app registration の client secret |
| `MOA_WINDOWS_SIGNING_ENDPOINT` | Signing account の endpoint。例: `https://eus.codesigning.azure.net/` |
| `MOA_WINDOWS_SIGNING_ACCOUNT_NAME` | Signing account name |
| `MOA_WINDOWS_SIGNING_CERTIFICATE_PROFILE_NAME` | Certificate profile name |

Trusted Signing を使う場合、Azure 側では対象 principal に certificate profile の署名権限を付与しておく。

### ローカルで署名を試す場合

ローカルで署名付き build を試す場合は、`trusted-signing-cli` をインストールし、GitHub Secrets と同じ値を環境変数に設定する。

```powershell
cargo install trusted-signing-cli

$env:AZURE_TENANT_ID = "<tenant-id>"
$env:AZURE_CLIENT_ID = "<client-id>"
$env:AZURE_CLIENT_SECRET = "<client-secret>"
$env:MOA_WINDOWS_SIGNING_ENDPOINT = "<signing-endpoint>"
$env:MOA_WINDOWS_SIGNING_ACCOUNT_NAME = "<account-name>"
$env:MOA_WINDOWS_SIGNING_CERTIFICATE_PROFILE_NAME = "<certificate-profile-name>"

pnpm --dir frontend tauri build --config ../backend/tauri.windows-signed.conf.json --bundles nsis
```

環境変数が不足している場合、`backend/scripts/sign-windows.ps1` は不足している変数名を表示して失敗する。

## 手動実行

GitHub Actions の `Windows Signed Release` workflow を `workflow_dispatch` で実行する。

生成される artifact には、Tauri が作成した Windows NSIS installer と実行ファイルを含める。
配布時は署名済み artifact だけを利用する。

## ローカル検証

署名済み workflow では、`Verify Authenticode signatures` step が `moa.exe` と NSIS installer の `Get-AuthenticodeSignature` 結果を確認する。
ローカルで確認する場合も、Windows 上で同じコマンドを使う。

```powershell
Get-AuthenticodeSignature .\path\to\moa.exe | Format-List
Get-AuthenticodeSignature .\path\to\moa_*_x64-setup.exe | Format-List
```

以下を確認する。

- `Status` が `Valid`
- `SignerCertificate.Subject` が想定した発行元
- `TimeStamperCertificate` が空ではない

Windows SDK の `signtool.exe` が使える環境では以下も確認する。

```powershell
signtool verify /pa /v .\path\to\moa.exe
signtool verify /pa /v .\path\to\moa_*_x64-setup.exe
```

Smart App Control または Windows Defender Application Control の判断を調べるときは、Microsoft の案内に従って Code Integrity ログを確認する。

```powershell
citool.exe -lp
Get-WinEvent -LogName "Microsoft-Windows-CodeIntegrity/Operational" |
  Where-Object { $_.Id -in 3076, 3077 } |
  Select-Object -First 20 TimeCreated, Id, Message
```

## 注意

- 署名直後でも、配布元やファイルの評判が十分でない間は SmartScreen の警告が出る可能性がある。
- Smart App Control はアプリ単位の許可リスト運用ではなく、署名と評判を前提にした配布に寄せる。
- 未署名 artifact はテスト用途に限定し、ユーザー向けには配布しない。
