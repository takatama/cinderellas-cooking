(function (root) {
  "use strict";
  // Japanese story edition. Pure content selection with injected navigation actions.
  function create({ getState, actions }) {
    const {
      start,
      deferHelp,
      advanceIntro,
      resumeHelp,
      restoreProgress,
      restartStory,
      result,
      openHistory,
      cook,
      skipCooking,
      currentCookingBeats,
      move,
      hold,
      resumeStory,
      render,
      log,
      doorInscription,
    } = actions;
    const line = (who, text) => ({ who, text });
    const recipe = () => root.Journey.recipes[getState().chapter || 0];
    const target = () => recipe().target;
    function content() {
      const state = getState();
      const { phase, step, items, dish } = state;
      if (phase === "resume")
        return {
          lines: [line("ものがたり", "前のお話のつづきが残っています。")],
          buttons: [
            ["つづきから遊ぶ", restoreProgress],
            ["最初から遊ぶ", restartStory],
          ],
        };
      const story = journeyContent();
      if (story) return story;
      if (phase === "intro") {
        const pages = [
          [
            line("ものがたり", "料理が得意なシンデレラ。"),
            ...(state.introBeat >= 1
              ? [line("ものがたり", "しかし、おねえさんがいじわるをして、")]
              : []),
            ...(state.introBeat >= 2
              ? [line("ものがたり", "大切な料理の本を隠してしまいました。")]
              : []),
          ],
          [
            line("ものがたり", "それなのに、お姉さんは料理を頼んできます。"),
            line("お姉さん", "シンデレラ、カレーを作っておいてね。"),
          ],
          [
            line(
              "シンデレラ",
              "材料さえ分かれば、おいしいカレーが作れるのに！",
            ),
            line(
              "ものがたり",
              "シンデレラのために、カレーの材料を選んであげますか？",
            ),
          ],
        ];
        return {
          lines: pages[state.introStep],
          prologue: state.introStep === 0,
          buttons:
            state.introStep === pages.length - 1
              ? [
                  ["はい", start],
                  ["いいえ", deferHelp],
                ]
              : [["つづきを読む　→", advanceIntro]],
        };
      }
      if (phase === "pause")
        return {
          lines: [line("シンデレラ", "また会えるのを楽しみにしているね。")],
          buttons: [["お願いにもどる", resumeHelp]],
        };
      if (phase === "select") {
        const current = state.round[step];
        return {
          lines:
            state.chapter === 0 && current.pairIndex === 0
              ? [line("シンデレラ", "カレーといえば、しらたき、かしら？")]
              : state.chapter === 0 && current.pairIndex === 2
                ? [
                    line(
                      "ものがたり",
                      "（シンデレラは、ちくわぶをじっと見つめています……）",
                    ),
                  ]
                : [],
          question:
            step === 0
              ? `${target()}に入れるのは、どっち？`
              : step === 1
                ? "２つ目の材料は？"
                : "最後の材料は？",
          choices: current.options,
        };
      }
      if (phase === "ready")
        return {
          lines: [
            line("シンデレラ", `${items.join("、")}だね。どうもありがとう！`),
            line("シンデレラ", "ようし、あとは私にまかせて！"),
          ],
          buttons: [
            ["お料理をお願いする　→", cook],
            ["材料を選びなおす", start],
          ],
          hint: "選んだ材料で、シンデレラが料理します。",
        };
      if (phase === "cooking")
        return {
          lines: currentCookingBeats()
            .slice(0, 3)
            .map((beat) => line("ものがたり", beat.join(""))),
          montage: true,
          buttons: [
            ["できた料理を見る", result],
            ["できあがりまで進む", skipCooking],
          ],
        };
      if (phase === "result") return cookingResult();
      return { lines: [], buttons: [] };
    }
    function cookingResult() {
      const state = getState();
      const correct = state.dish === target(),
        who = recipe().who;
      if (state.chapter === 0)
        return correct
          ? {
              lines: [
                line("ものがたり", "カレーのできあがり！"),
                line(who, "ふうん、まあまあね。……おかわり、大盛りで！"),
              ],
              buttons: [["おかわりをよそう　→", () => move("mother")]],
            }
          : {
              lines: [
                line("ものがたり", `${state.dish}ができました！`),
                line(who, "おいしいけれど、カレーとはちょっと違うわね。"),
                line("シンデレラ", "もう一度、作ってみよう！"),
              ],
              buttons: [["材料を選びなおす　↻", start]],
            };
      if (correct)
        return {
          lines: [
            line("ものがたり", `${state.dish}のできあがり！`),
            line(
              who,
              state.chapter === 1
                ? "ふうん、まあまあね。もっと食べるから、たくさんよこしなさい。"
                : "これは、すごい！なんておいしいアマトリチャーナなんだ！",
            ),
          ],
          buttons: [
            [
              "つづきを読む　→",
              () => move(state.chapter === 1 ? "prince" : "castle"),
            ],
          ],
        };
      const lines = [
        line("ものがたり", `${state.dish}ができました！`),
        line(
          who,
          state.chapter === 1
            ? `あら、これは${target()}とは言えないわね。`
            : `とてもおいしいけれど、${target()}とは違いますね。`,
        ),
      ];
      if (state.chapter === 2)
        lines.push(
          line(
            who,
            "イタリアのアマトリーチェという町で食べた、パスタにからまったトマトとベーコンの味が忘れられないのです。",
          ),
        );
      lines.push(line("シンデレラ", "もう一度、作ってみよう！"));
      return { lines, buttons: [["材料を選びなおす　↻", start]] };
    }
    function journeyContent() {
      const state = getState();
      const n = (t) => line("ものがたり", t),
        p = (t) => line("王子様", t);
      switch (state.phase) {
        case "mother":
          return {
            lines: [
              n("それを見ていたお母さん。"),
              line("お母さん", "私にはハンバーグを作って。"),
              n("シンデレラのために、ハンバーグの材料を選んであげますか？"),
            ],
            buttons: [
              ["はい", start],
              ["いいえ", hold],
            ],
          };
        case "prince":
          return {
            lines: [
              n("あれ？ 馬の足音が聞こえてきます。王子様が現れました。"),
              p(
                "おいしそうな匂いに引き寄せられてしまいました。私のためにアマトリチャーナを作ってくれませんか？",
              ),
              n(
                "シンデレラのために、アマトリチャーナの材料を選んであげますか？",
              ),
            ],
            buttons: [
              ["はい", start],
              ["いいえ", hold],
            ],
          };
        case "hold":
          return {
            lines: [line("シンデレラ", "また会えるのを楽しみにしているね。")],
            buttons: [["お話を再開する", resumeStory]],
          };
        case "castle":
          return {
            lines: [
              p(
                "あなたたちなら、王国に伝わる魔法の道具を使いこなせるかもしれない。お城に来てくれますか？",
              ),
              n("王子様と一緒に、お城へ行きますか？"),
            ],
            buttons: [
              ["お城へ行く　→", () => move("door")],
              ["またあとで", hold],
            ],
          };
        case "door": {
          const lines = [
            n("お城の奥に、大きな扉があります。"),
            p(
              "この部屋は、料理の上手な魔法使いが使っていました。別の国へ出かけてしまい、今は誰も入れないのです。",
            ),
            n(
              `扉には「${doorInscription()}」と書いてあります。鍵を開けるには、四つの数字が必要です。`,
            ),
          ];
          if (state.doorHint >= 1)
            lines.push(n("その横には「青は十五」と書いてあります。"));
          if (state.doorHint >= 2)
            lines.push(
              n(
                "ひらがなを「あ・い・う・え・お・か・き・く・け・こ」の順に並べて考えてみましょう。",
              ),
            );
          if (state.doorHint >= 3)
            lines.push(
              n(
                "「あ」は1、「い」は2。……「お」は5、「え」は4、「か」は6、「き」は7です。",
              ),
            );
          if (state.message) lines.push(n(state.message));
          return {
            lines,
            form: "door",
            buttons: [
              [
                "扉を詳しく調べる",
                () => {
                  state.doorHint = Math.min(3, state.doorHint + 1);
                  state.message = "";
                  render();
                },
              ],
            ],
          };
        }
        case "door-open":
          return {
            lines: [
              n("鍵の数字を合わせると、扉が開きました！"),
              p("さあ、中へ入りましょう。"),
            ],
            buttons: [["部屋に入る　→", () => move("room")]],
          };
        case "room":
          return {
            lines: [
              n("部屋の中には、魔法のオーブンが置いてあります。"),
              n(
                state.orange
                  ? "ピンク色の紙が残っています。"
                  : state.pink
                    ? "オレンジ色の紙が残っています。"
                    : "オレンジ色とピンク色の、二枚の紙が貼りつけてあります。",
              ),
              ...(!state.orange && !state.pink
                ? [n("どちらの紙を読みますか？")]
                : []),
            ],
            paper: true,
            buttons: [],
          };
        case "orange": {
          const lines = [
            n(
              "この道具は、ある材料を料理するために作られた。その材料の名前を呼ぶと、この紙がはがれ、料理ができるようになる。",
            ),
            n(
              "その材料とは、カンボジアから伝わった、カンボジアのような名前の野菜だ。",
            ),
          ];
          if (state.paperHint)
            lines.push(
              n(
                "南の瓜とも呼ばれる、北海道でたくさん取れる、外は緑で、中はオレンジの野菜です。",
              ),
            );
          if (state.message) lines.push(n(state.message));
          return {
            lines,
            form: "orange",
            buttons: [
              [
                "紙をもっと調べる",
                () => {
                  state.paperHint = true;
                  render();
                },
                state.paperHint,
              ],
              [
                "紙を選びなおす",
                () => move("room"),
                state.orange || state.pink,
              ],
            ],
          };
        }
        case "pink": {
          const lines = [
            n(
              "二つの材料の名前を呼ぶと、この紙がはがれ、料理ができるようになる。",
            ),
            n("材料は二つ。「たさまとごう」"),
          ];
          if (state.paperHint)
            lines.push(
              n(
                "どうやら、二つの材料の名前がバラバラに書いてあるみたいです。六つの文字を、三文字ずつに並べ替えてみましょう。",
              ),
            );
          if (state.message) lines.push(n(state.message));
          return {
            lines,
            form: "pink",
            buttons: [
              [
                "紙をもっと調べる",
                () => {
                  state.paperHint = true;
                  render();
                },
                state.paperHint,
              ],
              [
                "紙を選びなおす",
                () => move("room"),
                state.orange || state.pink,
              ],
            ],
          };
        }
        case "paper-solved":
          return {
            lines: [
              n(state.message),
              n(
                state.orange && state.pink
                  ? "二枚の紙がなくなり、魔法のオーブンが使えるようになりました！"
                  : state.orange
                    ? "ピンク色の紙が残っています。"
                    : "オレンジ色の紙が残っています。",
              ),
            ],
            buttons: [
              [
                "つづきを読む　→",
                () => move(state.orange && state.pink ? "final-ready" : "room"),
              ],
            ],
          };
        case "final-ready":
          return {
            lines: [
              line(
                "シンデレラ",
                "かぼちゃと、たまごと、砂糖！ そうだ、これでパンプキンプリンを作ったら、絶対においしいはず！",
              ),
            ],
            buttons: [
              ["魔法のオーブンで料理する　→", () => move("final-cooking")],
            ],
          };
        case "final-cooking":
          return {
            lines: [
              n(
                "シンデレラは、かぼちゃ、たまご、砂糖を使ってプリンを作ります。",
              ),
              n("魔法のオーブンの中で、プリンがゆっくり焼き上がりました。"),
            ],
            buttons: [["できた料理を見る　→", () => move("final-result")]],
          };
        case "final-result":
          return {
            lines: [
              n("パンプキンプリンのできあがり！ 王子様がひとくち食べました。"),
              p(
                "すごい！ すごい！ 素晴らしい！ なんておいしいパンプキンプリンなんだ！",
              ),
              p(
                "この素晴らしい味を、一人でも多くの国民に届けたいです。協力してくださいますか？",
              ),
            ],
            buttons: [
              [
                "はい",
                () => {
                  state.storyStep = 0;
                  move("ending");
                },
              ],
              ["またあとで", hold],
            ],
          };
        case "ending": {
          const pages = [
            [
              p(
                "どうもありがとうございます！ それでは、私が出資しますので、パンプキンプリンの会社を作りましょう。",
              ),
            ],
            [
              n(
                "シンデレラの会社は大繁盛。シンデレラは王子様と一緒に、幸せに暮らしましたとさ。",
              ),
            ],
            [
              n("え？ 意地悪なお姉さんとお母さんですか？"),
              n(
                "今でもシンデレラの料理が忘れられず、こっそりシンデレラの会社から、お取り寄せしているようですよ。",
              ),
            ],
          ];
          return {
            lines: pages[state.storyStep] || pages[0],
            buttons: [
              [
                "つづきを読む　→",
                () => {
                  if (state.storyStep < 2) {
                    state.storyStep++;
                    render();
                    log("おわりのお話", content().lines);
                  } else move("complete");
                },
              ],
            ],
          };
        }
        case "complete":
          return {
            lines: [
              n("これで「シンデレラの料理」は、おしまいです。"),
              line("シンデレラ", "最後まで手伝ってくれて、どうもありがとう！"),
            ],
            buttons: [
              ["ここまでのお話を読む", openHistory],
              ["最初から遊ぶ", restartStory],
            ],
          };
        default:
          return null;
      }
    }
    function journeyTitle() {
      const state = getState();
      return (
        {
          resume: "つづきから",
          mother: "お母さんのお願い",
          prince: "香りに誘われて",
          castle: "お城へ",
          door: "魔法使いの部屋",
          "door-open": "開いた扉",
          room: "二色の紙",
          orange: "オレンジ色の紙",
          pink: "ピンク色の紙",
          "paper-solved": "消えた紙",
          "final-ready": "魔法のオーブン",
          "final-cooking": "プリンを焼きましょう",
          "final-result": "王子様の願い",
          ending: "シンデレラの会社",
          complete: "おしまい",
          hold: "またあとで",
        }[state.phase] || "お料理"
      );
    }
    return { content, journeyTitle };
  }
  root.JapaneseStory = { create };
  if (typeof module !== "undefined") module.exports = root.JapaneseStory;
})(typeof window !== "undefined" ? window : globalThis);
