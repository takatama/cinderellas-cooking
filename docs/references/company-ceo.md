# 会社設立後のシンデレラ（2026-11-02）

ユーザーが採用した女性社長姿。`help-characters.png` の顔立ち・青い瞳・金髪の結い髪・青いリボンを基準に、青いスーツでプリン工房を仕切る。背景のスタッフは男女が一緒に働く構成に修正し、右端と左奥を男性スタッフにした。長い帳簿を小ぶりな木製クリップボードに変更し、紙面を本人側・木の裏面をプレイヤー側へ向けた最終案を採用した。

原画は `artwork/originals/company-ceo.png`。`artwork/assets.json` で登録し、配信画像と768px版を既存のビルドで生成する。工房（company）と完了（thanks）に使用。専用画に人物・発送箱・机・プリンが含まれるため、デコード完了後は旧人物・箱・独立した料理を非表示にする。読み込み中は旧人物を出さず、失敗時のみ従来の組み合わせに戻す。出資とお取り寄せ、会話・判定・セーブ形式は維持。

検証対象は `final-art.browser.cjs`（五画面、保存再開、幅の往復、画像失敗）、`scene-prefetch.browser.cjs`（先読み再利用）、通常の `npm run check` と `npm run check:assets`。

検証完了：通常の6テストファイル、58画像の画素・ハッシュ・縮小版検査、終幕の五画面と6組の画像失敗、先読み再利用の1280/390/320pxが成功。390pxの工房表示を実画像でも確認。

配信成功：2026-11-02 11:54 JST、所有者限定・同じURLを維持。Sitesソース `d8859d0100b57a6ac5da0e3555366d887a482949`、version_id `appgprj_6ae54da56ca481918db77b1973ddfb6c~appgver_200b6cadb5108191a6cadef1b32a9e42`、deployment_id `appgdep_6ae7fb44fbbc8191952264285df0d013`、`succeeded`。この配信記録の追記は資料のみ。

背景スタッフ修正の配信成功：2026-11-02 12:24 JST。男女のスタッフを描いた原画から配信画像を再生成し、58画像の画素・ハッシュ検査、1280/390pxで工房・完了の表示と重複・はみ出しなしを確認。Sitesソース `074b79c358e6a5b25259221570c49227fb46ddd6`、version_id `appgprj_6ae54da56ca481918db77b1973ddfb6c~appgver_2c98bdb134308191a50ca2db8cdf4bc2`、deployment_id `appgdep_6ae80275692081919b9716535bec0a25`、`succeeded`。
