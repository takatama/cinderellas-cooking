/* eslint-disable object-property-newline */
/* eslint-disable quotes */
/* eslint-disable spaced-comment */
/* eslint-disable indent */
/* eslint-disable semi */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const bucket = admin.storage().bucket('cinderellas-cooking.appspot.com');
const { dialogflow, Suggestions, BasicCard, Image, Button, SimpleResponse } = require('actions-on-google');

const ua = require('universal-analytics');
const ACCOUNT_ID = 'UA-116345351-5';
const uuid = require('uuid/v4');

const locale = conv => conv.user.locale;
const getUserId = conv => conv.user.userId;

const random = (...items) => items[Math.floor(Math.random() * items.length)];

const shuffle = items => {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
};

const load = conv => conv.data;

const CONTEXT_CONFIRM_CONTINUE = 'confirm_continue';
const CONTEXT_OPENING = 'opening';
const CONTEXT_CONFIRM_QUIZ0 = 'confirm_quiz0';
const CONTEXT_QUIZ0 = 'quiz0';
const CONTEXT_CONFIRM_REPLAY_QUIZ0 = 'confirm_replay_quiz0';
const CONTEXT_CONFIRM_QUIZ1 = 'confirm_quiz1';
const CONTEXT_QUIZ1 = 'quiz1';
const CONTEXT_CONFIRM_REPLAY_QUIZ1 = 'confirm_replay_quiz1';
const CONTEXT_CONFIRM_QUIZ2 = 'confirm_quiz2';
const CONTEXT_QUIZ2 = 'quiz2';
const CONTEXT_CONFIRM_REPLAY_QUIZ2 = 'confirm_replay_quiz2';
const CONTEXT_CONFIRM_CASTLE = 'confirm_castle';
const CONTEXT_DOOR = 'door';
const CONTEXT_ROOM = 'room';
const CONTEXT_ORANGE = 'orange';
const CONTEXT_PINK = 'pink';
const CONTEXT_CONFIRM_FINAL = 'confirm_final';
const CONTEXT_ENDING = 'ending';
const CONTEXT_CONFIRM_CLEAR_STORAGE = 'confirm_clear_storage';
const CONTEXT_CONFIRM_PLAY_GAME = 'confirm_play_game';

const savePersistent = (conv, obj) => {
    obj.userId = getUserId(conv);
    conv.user.storage = { ...conv.user.storage, ...obj };
};

const saveContext = conv => {
    const obj = load(conv);
    // CONTEXT_CONFIRM_CONTINUE は永続化しない。永続化すると前の context に戻せなくなる。
    if (obj.context === CONTEXT_CONFIRM_CONTINUE) {
        return;
    }
    delete obj.speechText;
    delete obj.reprompt;
    delete obj.suggestions;
    delete obj.answers;
    //delete obj.prevContext; //コンテキストをいつも保存するようにしたから、ここで消すと変なことになる。
    delete obj.food1;
    // コンテキストをいつも保存するようになったので、正確な値が取れない。
    //obj.elapsedTimeSec += Math.round((new Date() - new Date(obj.startTime)) / 1000);
    savePersistent(conv, obj);
};

const save = (conv, obj) => {
    conv.data = { ...conv.data, ...obj };
    if ('context' in obj) {
        const visitor = ua(ACCOUNT_ID, getUserId(conv));
        const category = locale(conv);
        const action = obj.context;
        const { playthrough, quiz, startTime } = load(conv);
        const label = `playthrough${playthrough}-quiz${quiz}`;
//いつもコンテキストを保存するようになったので正確な値が取れない
//        const elapsedTimeSec = obj.elapsedTimeSec + Math.round((new Date() - new Date(startTime)) / 1000);
        const elapsedTimeSec = Math.round((new Date() - new Date(startTime)) / 1000);
        const value = elapsedTimeSec;
        visitor.event(category, action, label, value).send();
        console.log(`google analytics event: category: ${category}, action: ${action}, label: ${label}, value: ${value}`);
        // Alexaとは違って、いつ終了するか分からないのでstorageに保存しておく
        saveContext(conv);
    }
};

const loadPersistent = conv => {
    return conv.user.storage;
};

const girl = speechText => `<voice gender="female" variant="2"><prosody pitch="+3st">"${speechText}"</prosody></voice>`;
const boy = speechText => `<voice gender="male" variant="1">"${speechText}"</voice>`;
const slow = speechText => `<prosody rate="x-slow">${speechText}</prosody>`;
const char = speechText => `<say-as interpret-as="character">${speechText}</say-as>`;

const GAME_TITLE = 'Cinderella\'s Cooking';

const has = (answers, ...ingredients) => {
    for (const i of ingredients) {
        if (answers.indexOf(i) === -1) {
            return false;
        }
    }
    return true;
};

const replaceAudio = async speechText => {
    const SOUNDS = {
        SOUND_BAKE_AND_BOIL: 'audio/bake-boil-alexa.mp3', // SOUND_BAKE より前に変換する
        SOUND_BAKE: 'audio/cooking-alexa.mp3',
        SOUND_FRY: 'audio/fry-alexa.mp3',
        SOUND_BOIL: 'audio/boiling-alexa.mp3',
        SOUND_CUT: 'audio/cut-alexa.mp3',
        SOUND_OVEN: 'audio/cooking-alexa.mp3', // TODO オーブンの音
        SOUND_OK: 'audio/kirakirarin-alexa.mp3',
        SOUND_NG: 'audio/stupid3-alexa.mp3',
        SOUND_SOSO: 'audio/hirameki2-alexa.mp3',
        SOUND_PICON: 'audio/picon-alexa.mp3',
        SOUND_DIAL: 'audio/dial-alexa.mp3',
        SOUND_DOOR: 'audio/door-alexa.mp3',
        SOUND_OPENING: 'audio/anime2-alexa.mp3',
        SOUND_ENDING: 'audio/gameclear-cute-alexa.mp3',
        SOUND_THINKING: 'audio/peritune-wish5.mp3',
        SOUND_CHEERS: 'audio/cheers.mp3'
    };
    await Promise.all(Object.keys(SOUNDS).map(async key => {
        if (speechText.indexOf(key) !== -1) {
            const a = await audio(SOUNDS[key]);
            speechText = speechText.replace(new RegExp(key, 'g'), a);
        }
    }));
    speechText = speechText
//        .replace(/SOUND_HORSE1/g, '<audio src="soundbank://soundlibrary/animals/amzn_sfx_horse_gallop_4x_02"/>')
        .replace(/SOUND_HORSE1/g, '<audio src="https://actions.google.com/sounds/v1/transportation/horse_and_carriage.ogg"/>')
//        .replace(/SOUND_HORSE2/g, '<audio src="soundbank://soundlibrary/animals/amzn_sfx_horse_huff_whinny_01"/>')
        .replace(/SOUND_HORSE2/g, '')
//          .replace(/SOUND_WALKING/g, '<audio src="soundbank://soundlibrary/human/amzn_sfx_human_walking_03"/>')
        .replace(/SOUND_WALKING/g, '<audio src="https://actions.google.com/sounds/v1/foley/dress_shoe_walk_solid_wood.ogg"/>')
//        .replace(/SOUND_THINKING/g, '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_countdown_loop_64s_minimal_01"/>');
    return speechText;
};

const audio = async (key) => {
    const soundFileRef = bucket.file(key);
    const bucketAccessConfig = {
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60
    };
    const [soundUrl] = await soundFileRef.getSignedUrl(bucketAccessConfig);
    const escaped = soundUrl.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
    return `<audio src="${escaped}" />`;
};

const bake = () => 'SOUND_BAKE';
const bakeAndBoil = () => 'SOUND_BAKE_AND_BOIL';
const fry = () => 'SOUND_FRY';
const boil = () => 'SOUND_BOIL';
const cut = () => 'SOUND_CUT';
const oven = () => 'SOUND_OVEN';
const ok = () => 'SOUND_OK';
const ng = () => 'SOUND_NG';
const soso = () => 'SOUND_SOSO';
const horse1 = () => 'SOUND_HORSE1';
const horse2 = () => 'SOUND_HORSE2';
const walking = () => 'SOUND_WALKING';
const thinking = () => 'SOUND_THINKING';
const picon = () => 'SOUND_PICON';
const dial = () => 'SOUND_DIAL';
const door = () => 'SOUND_DOOR';
const opening = () => 'SOUND_OPENING';
const ending = () => 'SOUND_ENDING';
const cheers = () => 'SOUND_CHEERS';

const getPatterns = playthrough => {
    if (playthrough === 0) {
        return [0, 0, 0, 0, 0];
    }
    if (playthrough === 1) {
        return [1, 1, 1, 1, 1];
    }
    if (playthrough === 2) {
        return [2, 2, 2, 2, 2];
    }
    return shuffle([0, 0, 1, 1, 2, 2]).slice(0, 5);
};

const ask = async (conv, speechText, reprompt = '', hint = '', suggestions = undefined) => {
    if (reprompt === '') {
        save(conv, { speechText, reprompt: speechText, suggestions });
        const ssml = `<speak>${await replaceAudio(speechText)}</speak>`;
        if (suggestions) {
            conv.ask(new Suggestions(suggestions));
        }
        return conv.ask(ssml);
    }
    save(conv, { speechText: speechText + ' ' + reprompt, reprompt: reprompt + ' ' + hint, suggestions });
    if (suggestions) {
        conv.ask(new Suggestions(suggestions));
    }
    return conv.ask(`<speak>${await replaceAudio(speechText + ' ' + reprompt)}</speak>`);
};

const close = async (conv, speechText) => {
    return conv.close(`<speak>${await replaceAudio(speechText)}</speak>`);
}

const a_ = str => {
    if (/^[aiueo]/.test(str.toLowerCase())) {
        return `an ${str}`;
    }
    return `a ${str}`;
};

const askYesOrNo = (conv, speechText, reprompt) => {
    //    return ask(conv, speechText, reprompt, `はい、か、いいえ、でお願いします。`);
    return ask(conv, speechText, reprompt, `Please answer with Yes or No. `, ['Yes', 'No']);
};

const confirmQuiz0 = (conv, speechText = '') => {
    save(conv, { quiz: 0, step: 0, answers: [], orangeCleared: false, pinkCleared: false });
    const target = getQuiz0(conv).target;
    speechText += [
//        `料理が得意なシンデレラ。しかし、お姉さんがいじわるをして、大切な料理の本を隠してしまいました。`,
//        `それなのに、お姉さんはシンデレラに、${target}を作っておきなさい、と仕事を押しつけてきます。`,
//        girl(`私の名前はシンデレラ。材料さえ分かれば、おいしい${target}が作れるのに！`),
//        `<break time="0.5s"/>`
        `Cinderella is good at cooking.`,
        `One day, her evil stepsister hid Cinderella's important recipe book, and then ordered Cinderella to make ${a_(target)}.`,
        girl(`My name is Cinderella. I can't find my recipe book. What am I gonna do? I can make a delicious ${target} if only someone could tell me the ingredients.`)
    ].join(' ');
//    const reprompt = `シンデレラのために、${target}の材料を選んであげますか？ `;
    const reprompt = `Would you choose ingredients for the ${target} to help Cinderella? `;
    save(conv, { context: CONTEXT_CONFIRM_QUIZ0 });
    return askYesOrNo(conv, speechText, reprompt);
};

const confirmQuiz1 = (conv, preSpeech) => {
    const nextTarget = getQuiz1(conv).target;
    let speechText;
    if (preSpeech) { // 通常版
        speechText = [
            preSpeech,
//            'ふうん、まぁまぁね。もっとたくさんよそって、と嬉しそう。', ok(),
//            `それを見ていたお母さん、私には${nextTarget}を作って、と言いつけました。`,
            `"Well, I can not say it bad. Give me one more", the mean sister said joyfully.`, ok(),
            `The stepmother was watching it and told Cinderella to make ${a_(nextTarget)} for her.`
        ].join(' ');
    } else { // 再実行
//        speechText = `お母さんはシンデレラに、${nextTarget}を作って、と言いつけました。`;
        speechText = `The stepmother was watching it and told Cinderella to make ${a_(nextTarget)} for her. `;
    }
//    const reprompt = `シンデレラのために${nextTarget}の材料を選んであげますか？ `;
    const reprompt = `Would you choose ingredients for the ${nextTarget} to help Cinderella? `;
    save(conv, { context: CONTEXT_CONFIRM_QUIZ1 });
    return askYesOrNo(conv, speechText, reprompt);
};

const confirmQuiz2 = (conv, preSpeech) => {
    const nextTarget = getQuiz2(conv).target;
    let speechText = '';
    if (preSpeech) { // 通常版
//        speechText = `${preSpeech}ふうん、まぁまぁね。もっと食べるからたくさんよこしなさい、と嬉しそう。${ok()}`;
        speechText = `${preSpeech}"Hmm. So, so. Make me another one.", the mean mother said contentedly. ${ok()}`;
    }
    speechText += [
//        'あれ？馬の足音が聞こえてきます。' + horse1() + horse2(),
//        '王子様が現れました。',
//        boy(`おいしそうな匂いに引き寄せられてしまいました。私のために${nextTarget}を作ってくれませんか？`),
        `Oh, what is it? You hear horse footsteps.`, horse1(), horse2(),
        `A charming prince appeared.`,
        boy(`The smell of delicious food brought me here. Could you make ${a_(nextTarget)} for me?`)
    ].join(' ');
//    const reprompt = `シンデレラのために、${nextTarget}の材料を選んであげますか？ `;
    const reprompt = `Would you choose ingredients for the ${nextTarget} to help Cinderella? `;
    save(conv, { context: CONTEXT_CONFIRM_QUIZ2 });
    return askYesOrNo(conv, speechText, reprompt);
};

const confirmCastle = (conv, speechText = '') => {
    const q = getQuiz2(conv);
    speechText += [
        //                boy(`これは、すごい！何ておいしい${q.target}なんだ！`), ok(),
        //                boy(`あなたたちなら、王国に伝わる魔法の道具を、使いこなせるかもしれない。お城に来てくれますか？`),
        boy(`This is amazing! What a delicious ${q.target}!`), ok(),
        boy(`Maybe you can use a magical tool passed down in the kingdom. Could you come to the castle with me? `)
    ].join(' ');
//    const reprompt = `王子様と一緒に、お城へ行きますか？ `;
    const reprompt = `Would you like to go to the castle with the prince? `;
    save(conv, { context: CONTEXT_CONFIRM_CASTLE });
    return askYesOrNo(conv, speechText, reprompt);
};

const startDoor = (conv, preSpeech) => {
    save(conv, { context: CONTEXT_DOOR, quiz: 3, step: 0, answers: [] });
    let speechText = '';
    if (preSpeech) { // 通常版
        speechText = preSpeech;
    }
    speechText += [
//        '大きな扉の前まで来ました。',
//        boy(`この部屋は、料理の上手な魔法つかいが使っていました。けれど、魔法つかいは別の国に出かけてしまい、この部屋には誰もはいることができないのです。`)
        `You are now in front of a big door.`,
        boy(`This room used to be occupied by a wizard who was good at cooking. However, the wizard has gone to another country, and no one has been able to enter this room.`)
    ].join(' ');
    const question = getQuiz3(conv).question;
    const reprompt = [
//        '扉には鍵がかかっています。ダイヤル式の鍵です。開けるためには4つの数字が必要です。',
//        `扉にはひらがなで、${slow(getQuiz3(conv).question)}、と書いてあります。`,
//        '数字を合わせますか？扉を詳しく調べますか？'
        `The door is locked. You need to dial four numbers and get the right combination to open it.`,
        `A word ${slow(`${question}, ${char(question)}`)} is written on the door.`,
        `You can set numbers or examine the door more. What would you like to do?'`
    ].join(' ');
    return ask(conv, speechText, reprompt, '', ['Set numbers', 'Examine']);
};

const startRoom = (conv, preSpeech) => {
    save(conv, { context: CONTEXT_ROOM, quiz: 4, step: 0, answers: [] });
    let speechText = '';
    if (preSpeech) { // 通常版
        speechText = preSpeech;
    }
    const tool = getQuiz4(conv).tool;
//    speechText += `部屋の中には、${tool}が置いてあります。`;
    // TODO a or an depends on the name of the tool.
    speechText += `There is a magical ${tool} in the room. `;
    const reprompt = [
//        `${tool}には二つの紙がはりつけてあります。オレンジ色の紙と、ピンク色の紙です。`,
//        `どちらの紙を読みますか？`
        `Two sheets of paper are put on the ${tool}. Orange paper and pink paper. `,
        `Which paper would you like to read?`
    ].join(' ');
    return ask(conv, speechText, reprompt, '', ['Orange', 'Pink']);
};

const setupSession = conv => {
    const startTime = (new Date()).toISOString();
    const user = loadPersistent(conv);

    if (user && ('playthrough' in user)) {
        user.visitCount += 1;
        user.prevContext = user.context;
        user.startTime = startTime;
        save(conv, user);
        return user;
    }

    const playthrough = 0;
    const initUser = {
        createdAt: startTime, startTime, elapsedTimeSec: 0, visitCount: 1,
        playthrough, patterns: getPatterns(playthrough), context: CONTEXT_OPENING,
        quiz: 0, step: 0, answers: [], orangeCleared: false, pinkCleared: false
    };
    save(conv, initUser);
    return initUser;
};

const LaunchRequestHandler = (conv, speechText = '') => {
    // conv.ask(new SimpleResponse({speech: '', text: '(Please talk to me, if you want to play with music)' }));
    const user = setupSession(conv);
    if ([CONTEXT_OPENING, CONTEXT_CONFIRM_PLAY_GAME].indexOf(user.context) !== -1) {
        return confirmQuiz0(conv, speechText + opening());
    }
    // let speechText = opening() + random(`おかえりなさい！`, `またお会いできて嬉しいです！`, `また遊びに来てくれたんですね！お会いできて嬉しいです！`);
    speechText += opening() + random(`I'm glad to see you, again! `, `Welcome back! `);
    if (user.context === CONTEXT_ENDING) {
        speechText += [
            // `前回はゲームクリア、${interjection('おめでとうございます！')}`, ok(),
            // `さて、今回はどんなお料理を作ることになるのでしょうか？どうぞお楽しみください。<break time="0.8s"/>`
            `Congratulations on clearing the game!`, cheers(),
            `What kind of dishes will you make this time? Please enjoy yourself. <break time="1.0s"/>`
        ].join(' ');
        return confirmQuiz0(conv, speechText);
    }
    // speechText += `前に遊んでくれた時は、${getPrevContext(user.context).past}`;
    speechText += `When you were here last time, ${getPrevContext(user.context).past}`;
    // const reprompt = `続きから始めますか？最初から始めますか？ `;
    const reprompt = `Would you like to continue from the previous session, or to start over? `;
    save(conv, { context: CONTEXT_CONFIRM_CONTINUE });
    return ask(conv, speechText, reprompt, '', ['Continue', 'Start over']);
};

const askReprompt = async (conv) => {
    const { context, reprompt, suggestions } = load(conv);
    console.error(`askReprompt: context: ${context}, intent: ${conv.intent}, reprompt: ${reprompt}`);
//    const speechText = `すみません。うまく聞き取れませんでした。`;
    let speechText = `${random(`I did't get that. `, `I did't understand. `)}`;
    if (suggestions) {
        conv.ask(new Suggestions(suggestions));
    }
    if (reprompt) {
        speechText += ' ' + reprompt;
    }
    return conv.ask(`<speak>${await replaceAudio(speechText)}</speak>`);
};

const askStartSelecting = (conv, preSpeech) => {
    const { context, step } = load(conv);
    let q;
    if (context === CONTEXT_QUIZ0) q = getQuiz0(conv);
    if (context === CONTEXT_QUIZ1) q = getQuiz1(conv);
    if (context === CONTEXT_QUIZ2) q = getQuiz2(conv);
//    const speechText = `${preSpeech}${q.target}の材料を選びましょう。`;
    const speechText = `${preSpeech} Let's choose 3 ${random('important', 'essential')} ingredients for ${q.target}. `;
//    let reprompt = `${q.ingredients[step].join('、と、')}、どちらにしますか？ `;
    const ingredients = shuffle(q.ingredients[step]);
    let reprompt = `${random(`First of all`, `At first`, `To begin with`)}, which would you choose ${ingredients.join(' or ')}. `;
    if (q.hints && q.hints[step]) {
        reprompt += ' ' + q.hints[step];
    }
//    return ask(conv, speechText, reprompt, `${q.target}の材料ですよ？`);
    return ask(conv, speechText, reprompt, `For ${q.target}. `, ingredients);
};

const hasWebBrowser = conv => conv.surface.capabilities.has('actions.capability.WEB_BROWSER');

const CARD_JA = {
  title: 'サンタの脱出',
  subtitle: '@takatama_jp',
  text: `最後まで遊んでいただき、ありがとうございました！`,
  buttons: new Button({
    title: '星の数を見てみる',
    url: 'https://assistant.google.com/services/a/uid/000000463a435e5b?hl=ja'
  }),
  image: new Image({
    url: 'https://storage.googleapis.com/cinderellas-cooking.appspot.com/image/cinderellas-cooking-mini.png',
    alt: 'サンタの脱出'
  }),
  display: 'CROPPED'
};

const CARD_EN = {
  title: `${GAME_TITLE}`,
  subtitle: '@takatama_jp',
  text: `I appreciate you for playing all the way through. I hope you had a good time. If you enjoyed this game, please tap stars to rate in the review page and express how much fun this game is! Thank you very much for your support!`,
  buttons: new Button({
    title: 'See Stars',
    url: 'https://assistant.google.com/services/a/uid/000000efe84e749b?hl=en'
  }),
  image: new Image({
    url: 'https://storage.googleapis.com/cinderellas-cooking.appspot.com/image/cinderellas-cooking-mini.png',
    alt: `${GAME_TITLE}`
  }),
  display: 'CROPPED'
};

const replay = conv => {
    //        return askStartSelecting(conv, `気を取り直して、`);
    return askStartSelecting(conv, random(`Let’s just try to do better next time. `, `Onward and upward! `));
};

const getQuiz0 = (conv) => {
    const { patterns } = load(conv);
    return QUIZ0[patterns[0]];
};

const getQuiz1 = (conv) => {
    const { patterns } = load(conv);
    return QUIZ1[patterns[1]];
};

const getQuiz2 = (conv) => {
    const { patterns } = load(conv);
    return QUIZ2[patterns[2]];
};

const getQuiz3 = (conv) => {
    const { patterns } = load(conv);
    return QUIZ3[patterns[3]];
};

const getQuiz4 = (conv) => {
    const { patterns } = load(conv);
    return QUIZ4[patterns[4]];
};

const QUIZ0 = [{
    user: 'the stepsister',
    target: 'cheeseburger',
    ingredients: [
        ['ground beef', 'sausage'],
        ['bun', 'spaghetti'],
        ['cheese', 'mushroom']
    ],
    hints: [``, ``, ``]
}, {
    user: 'the stepsister',
    target: 'cheese dog',
    ingredients: [
        ['ground beef', 'sausage'],
        ['bun', 'spaghetti'],
        ['cheese', 'mushroom']
    ],
    hints: [``, ``, ``]
}, {
    user: 'the stepsister',
    target: 'bacon and egg fried rice',
    ingredients: [
        ['bacon', 'chicken'],
        ['tomato', 'egg'],
        ['spaghetti', 'rice']
    ],
    hints: [``, ``, ``]
}];

/*
const QUIZ0 = [{
    user: 'お姉さん',
    target: 'カレー',
    ingredients: [
        ['豚肉', 'しらたき'],
        ['じゃがいも', 'たまご'],
        ['カレールー', 'ちくわぶ']
    ],
    hints: [
        girl(`カレーといえば、しらたき、かしら？`),
        ``,
        `シンデレラは、ちくわぶをじっと見つめています。`
    ]
}, {
    user: 'お姉さん',
    target: 'ロールキャベツ',
    ingredients: [
        ['ひき肉', 'じゃがいも'],
        ['キャベツ', 'パン粉'],
        ['玉ねぎ', '青のり']
    ],
    hints: [``, ``,  ``]
}, {
    user: 'お姉さん',
    target: 'チキンライス',
    ingredients: [
        ['お米', 'パスタ'],
        ['トマト', 'たまご'],
        ['とり肉', 'ベーコン']
    ],
    hints: [``, ``,  ``]
}];
*/

const QUIZ1 = [{
    user: 'the stepmother',
    target: 'BLT sandwich',
    ingredients: [
        ['bacon', 'chicken'],
        ['lettuce', 'egg'],
        ['tomato', 'avocado']
    ],
    hints: ['', '', ''],
    hintForFail: `The stepmother said that B is bacon, L is lettuce, and T is tomato. `
}, {
    user: 'the stepmother',
    target: 'tomato risotto',
    ingredients: [
        ['spaghetti', 'rice'],
        ['bacon', 'chicken'],
        ['tomato', 'egg']
    ],
    hints: ['', '', '']
}, {
    user: 'the stepmother',
    target: 'egg salad sandwich',
    ingredients: [
        ['cucumber', 'egg'],
        ['tomato', 'mayo'],
        ['bun', 'ham']
    ],
    hints: ['', '', '']
}];

/*
const QUIZ1 = [{
    user: 'お母さん',
    target: 'ハンバーグ',
    ingredients: [
        ['ひき肉', 'じゃがいも'],
        ['パン粉', 'キャベツ'],
        ['玉ねぎ', '青のり']
    ],
    hints: ['', '', '']
}, {
    user: 'お母さん',
    target: '親子丼',
    ingredients: [
        ['お米', 'パスタ'],
        ['たまご', 'トマト'],
        ['とり肉', 'ベーコン']
    ],
    hints: ['', '', '']
}, {
    user: 'お母さん',
    target: 'オムレツ',
    ingredients: [
        ['トマト', 'マヨネーズ'],
        ['たまご', 'キュウリ'],
        ['ハム', 'パン']
    ],
    hints: ['', '', '']
}];
*/

const QUIZ2 = [{
    user: 'the prince',
    target: 'Amatriciana',
    hintForFail: boy(`I can't forget the rich taste of tomato and bacon with spaghetti. I ate it in a town called Amatrice in Italy. `),
    ingredients: [
        ['spaghetti', 'rice'],
        ['tomato', 'egg'],
        ['bacon', 'chicken']
    ],
    hints: ['', '', '']
}, {
    user: 'the prince',
    target: 'Gazpacho',
    hintForFail: boy(`I can't forget the taste of tomato, cucumber, and bread that I ate in Spain in the hot summer.`),
    ingredients: [
        ['tomato', 'mayo'],
        ['cucumber', 'egg'],
        ['bun', 'ham']
    ],
    hints: ['', '', '']
}, {
    user: 'the prince',
    target: 'Thermidor',
    hintForFail: boy(`I can't forget the taste of lobster with white sauce made of flour and butter.`),
    ingredients: [
        ['lobster', 'chicken'],
        ['flour', 'bouillon'],
        ['butter', 'white wine']
    ],
    hints: ['', '', '']
}];

/*
const QUIZ2 = [{
    user: '王子様',
    target: 'アマトリチャーナ',
    hintForFail: boy(`イタリアのアマトリーチェという町で食べた、パスタにからまったトマトとベーコンの味が忘れられないのです。`),
    ingredients: [
        ['パスタ', 'お米'],
        ['トマト', 'たまご'],
        ['ベーコン', 'とり肉']
    ],
    hints: ['', '', '']
}, {
    user: '王子様',
    target: 'ガスパッチョ',
    hintForFail: boy(`暑い夏にスペインで食べた、トマト、キュウリ、パンが溶け込んだあの味が忘れられないのです。`),
    ingredients: [
        ['トマト', 'マヨネーズ'],
        ['キュウリ', 'たまご'],
        ['パン', 'ハム']
    ],
    hints: ['', '', '']
}, {
    user: '王子様',
    target: 'テルミドール',
    hintForFail: boy(`イセエビに、小麦粉とバターで作ったホワイトソースをかけて作る、あの味が忘れられないのです。`),
    ingredients: [
        ['イセエビ', 'とり肉'],
        ['小麦粉', 'ブイヨン'],
        ['バター', '白ワイン']
    ],
    hints: ['', '', '']
}];
*/

/**
    'ACID': 1394,
    'CAGE': 3175,
    'CHAI': 3819,
    'CHEF': 3856,
    'FACE': 6135,
    'HEAD': 8514,
    'ICED': 9354,
    'IDEA': 9451,
*/
const QUIZ3 = [{
    question: 'CHEF',
    answer: '3856',
    hint: ''
}, {
    question: 'FACE',
    answer: '6135',
    hint: ''
}, {
    question: 'IDEA',
    answer: '9451',
    hint: ''
}];

/*
const QUIZ3 = [{
    question: 'お絵描き',
    answer: '5467',
    hint: '折り紙の、お。絵本の、え。カラスの、か。キリンの、き、です。'
}, {
    question: '家買う',
    answer: '2463',
    hint: 'インコの、い。絵本の、え。カラスの、か。ウサギの、う、です。'
}, {
    question: '計画',
    answer: '9268',
    hint: '毛虫の、け。インコの、い。カラスの、か。車の、く、です。'
}];
*/

const QUIZ4 = [{
    tool: 'oven',
    cuisine: 'pumpkin pudding',
    orange: {
        question: `It has seeds but it is not a watermelon. It can be made into a pie but it is not an apple. It is orange but it is not an orange. `,
        food: 'pumpkin',
        hint: [
            `The orange paper also says that it is a kind of vegitable, `,
            `its seeds are edible, and it can be scary but it is not a ghost. `
        ].join(' ')
    },
    pink: {
        question: [
            `There are two materials. ${slow(char('SEUGGGAR'))} `
        ].join(' '),
        foods: ['sugar', 'egg'],
        hint: [
            `The pink paper says that there are two materials. ${slow(char('SEUGGGAR'))} `,
            `Apparently, the names of the two ingredients are mixed.`
        ].join(' ')
    }
}, {
    tool: 'salad bowl',
    cuisine: 'pumpkin salad',
    orange: {
        question: `Its name starts with "P" and is 7 characters length. `,
        food: 'pumpkin',
        hint: [
            `The orange paper also says that it is a kind of vegitable, `,
            `its seeds are edible, and it can be scary but it is not a ghost. `
        ].join(' ')
    },
    pink: {
        question: [
            `There are two materials. ${slow(char('SMAALYTO'))} `
        ].join(' '),
        foods: ['salt', 'mayo'],
        hint: [
            `The pink paper says that there are two materials. ${slow(char('SMAALYTO'))} `,
            `Apparently, the names of the two ingredients are mixed.`
        ].join(' ')
    }
}, {
    tool: 'pot',
    cuisine: 'pumpkin soup',
    orange: {
        question: `Its name has two "P", ends with "N" and is 7 characters length. `,
        food: 'pumpkin',
        hint: [
            `The orange paper also says that it is a kind of vegitable, `,
            `its seeds are edible, and it can be scary but it is not a ghost. `
        ].join(' ')
    },
    pink: {
        question: [
            `There are two materials. ${slow(char('SOTNOICOKN'))} `
        ].join(' '),
        foods: ['stock', 'onion'],
        hint: [
            `The pink paper says that there are two materials. ${slow(char('SOTNOICOKN'))} `,
            `Apparently, the names of the two ingredients are mixed.`
        ].join(' ')
    }
}];

/*
const QUIZ4 = [{
    tool: 'オーブン',
    cuisine: 'パンプキンプリン',
    orange: {
        question: 'その材料とは、カンボジアから伝わった、カンボジアのような名前の野菜だ。',
        food: 'かぼちゃ',
        hint: [
            'オレンジ色の紙を調べると、カンボジアから伝わった、カンボジアのような名前の野菜だ、と書いてあります。さらに',
            '「南の瓜とも呼ばれる、北海道でたくさん取れる、外は緑で、中はオレンジの野菜だ」と書いてあります。',
            'これ以上は書いてありません。'
        ].join(' ')
    },
    pink: {
        question: [
            `材料は二つ。${slow('たさまとごう')}。<break time="0.5s"/>`,
            '六つのひらがなが書いてあります。太鼓の、た、桜の、さ、マッチの、ま、トンボの、と、ゴリラの、ご、ウサギの、う、です。'
        ].join(' '),
        foods: ['たまご', '砂糖'],
        hint: [
            `ピンク色の紙を調べると、材料は二つ。${slow('たさまとごう')}、<break time="0.5s"/>と書いてあります。`,
            'どうやら、二つの材料の名前がバラバラに書いてあるみたいです。',
            '六つのひらがなが書いてあります。太鼓の、た、桜の、さ、マッチの、ま、トンボの、と、ゴリラの、ご、ウサギの、う、です。',
        ].join(' ')
    }
}, {
    tool: 'サラダボウル',
    cuisine: 'パンプキンサラダ',
    orange: {
        question: 'その材料とは、八百屋に売っているパンのような名前の野菜だ。',
        food: 'パンプキン',
        hint: [
            'オレンジ色の紙を調べると、八百屋に売っているパンのような名前の野菜だ、と書いてあります。さらに',
            '「南の瓜とも呼ばれる、北海道でたくさん取れる、外は緑で、中はオレンジの野菜だ」と書いてあります。',
            'これ以上は書いてありません。'
        ].join(' ')
    },
    pink: {
        question: [
            `材料は二つ。${slow('ましよーねおず')}。<break time="0.5s"/>`,
            '六つのひらがなと、伸ばし棒が書いてあります。マッチの、ま。新聞の、し。ヨーヨーの、よー。ネズミの、ね。折り紙の、お。図鑑の、ず。です。'
        ].join(' '),
        foods: ['塩', 'マヨネーズ'],
        hint: [
            `ピンク色の紙を調べると、材料は二つ。${slow('ましよーねおず')}、<break time="0.5s"/>と書いてあります。`,
            'どうやら、二つの材料の名前がバラバラに書いてあるみたいです。',
            '六つのひらがなと、伸ばし棒が書いてあります。マッチの、ま。新聞の、し。ヨーヨーの、よー。ネズミの、ね。折り紙の、お。図鑑の、ず。です。'
        ].join(' ')
    }
}, {
    tool: '鍋',
    cuisine: 'かぼちゃスープ',
    orange: {
        question: 'その材料とは、八百屋に売っているお茶のような名前の野菜だ。',
        food: 'かぼちゃ',
        hint: [
            'オレンジ色の紙を調べると、八百屋に売っているお茶のような名前の野菜だ、と書いてあります。さらに',
            '「南の瓜とも呼ばれる、北海道でたくさん取れる、外は緑で、中はオレンジの野菜だ」と書いてあります。',
            'これ以上は書いてありません。'
        ].join(' ')
    },
    pink: {
        question: [
            `材料は二つ。${slow('こんしそめん')}。<break time="0.5s"/>`,
            '六つのひらがなが書いてあります。子供の、こ。おしまいの、ん。新聞の、し。そろばんの、そ。メダカの、め。おしまいの、ん。です。'
        ].join(' '),
        foods: ['塩', 'コンソメ'],
        hint: [
            `ピンク色の紙を調べると、材料は二つ。${slow('こんしそめん')}、<break time="0.5s"/>と書いてあります。`,
            'どうやら、二つの材料の名前がバラバラに書いてあるみたいです。',
            '六つのひらがなが書いてあります。子供の、こ。おしまいの、ん。新聞の、し。そろばんの、そ。メダカの、め。おしまいの、ん。です。'
        ].join(' ')
    }
}];
*/

const cuisine = answers => {
    // QUIZ0-a, QUIZ0-b
    if (has(answers, 'ground beef', 'bun', 'cheese')) return { cuisine: 'cheeseburger', sound: bake() }; // 0-0
    if (has(answers, 'ground beef', 'bun', 'mushroom')) return { cuisine: 'beef stroganoff sandwich', sound: cut() };
    if (has(answers, 'ground beef', 'spaghetti', 'cheese')) return { cuisine: 'spaghetti casserole', sound: boil() };
    if (has(answers, 'ground beef', 'spaghetti', 'mushroom')) return { cuisine: 'spaghetti with mushroom meat sauce', sound: boil() };
    if (has(answers, 'sausage', 'bun', 'cheese')) return { cuisine: 'cheese dog', sound: cut() };
    if (has(answers, 'sausage', 'bun', 'mushroom')) return { cuisine: 'sausage roll', sound: cut() };
    if (has(answers, 'sausage', 'spaghetti', 'cheese')) return { cuisine: 'cheesy sausage spaghetti', sound: boil() };
    if (has(answers, 'sausage', 'spaghetti', 'mushroom')) return { cuisine: 'spaghetti with sausage and mashroom', sound: boil() };
    // QUIZ1-a
    if (has(answers, 'bacon', 'lettuce', 'tomato')) return { cuisine: 'BLT sandwich', sound: cut() };
    if (has(answers, 'bacon', 'lettuce', 'avocado')) return { cuisine: 'cobb salad', sound: cut() };
    if (has(answers, 'bacon', 'egg', 'tomato')) return { cuisine: 'cobb salad', sound: cut() };
    if (has(answers, 'bacon', 'egg', 'avocado')) return { cuisine: 'cobb salad', sound: cut() };
    if (has(answers, 'chicken', 'lettuce', 'tomato')) return { cuisine: 'cobb salad', sound: cut() };
    if (has(answers, 'chicken', 'lettuce', 'avocado')) return { cuisine: 'cobb salad', sound: cut() };
    if (has(answers, 'chicken', 'egg', 'tomato')) return { cuisine: 'cobb salad', sound: cut() };
    if (has(answers, 'chicken', 'egg', 'avocado')) return { cuisine: 'cobb salad', sound: cut() };
    // QUIZ2-a, QUIZ1-b, QUIZ0-c
    if (has(answers, 'spaghetti', 'tomato', 'bacon')) return { cuisine: 'Amatriciana', sound: boil() };
    if (has(answers, 'spaghetti', 'tomato', 'chicken')) return { cuisine: 'chicken spaghetti', sound: boil() };
    if (has(answers, 'spaghetti', 'egg', 'bacon')) return { cuisine: 'carbonara', sound: boil() };
    if (has(answers, 'spaghetti', 'egg', 'chicken')) return { cuisine: 'chicken carbonara', sound: boil() };
    if (has(answers, 'rice', 'tomato', 'bacon')) return { cuisine: 'tomato risotto', sound: boil() };
    if (has(answers, 'rice', 'tomato', 'chicken')) return { cuisine: 'tomato risotto', sound: boil() };
    if (has(answers, 'rice', 'egg', 'bacon')) return { cuisine: 'bacon and egg fried rice', sound: bake() };
    if (has(answers, 'rice', 'egg', 'chicken')) return { cuisine: 'chicken fried rice', sound: bake() };
    // QUIZ2-b, QUIZ1-c
    if (has(answers, 'tomato', 'cucumber', 'bun')) return { cuisine: 'Gazpacho', sound: cut() };
    if (has(answers, 'tomato', 'cucumber', 'ham')) return { cuisine: 'vegetable salad', sound: cut() };
    if (has(answers, 'tomato', 'egg', 'bun')) return { cuisine: 'Aquacotta', sound: oven() };
    if (has(answers, 'tomato', 'egg', 'ham')) return { cuisine: 'Omelette', sound: bake() };
    if (has(answers, 'mayo', 'cucumber', 'bun')) return { cuisine: 'cucumber sandwich', sound: cut() };
    if (has(answers, 'mayo', 'cucumber', 'ham')) return { cuisine: 'ham salad', sound: cut() };
    if (has(answers, 'mayo', 'egg', 'bun')) return { cuisine: 'egg salad sandwich', sound: cut() };
    if (has(answers, 'mayo', 'egg', 'ham')) return { cuisine: 'ham and eggs', sound: bake() };
    // QUIZ3-c
    if (has(answers, 'lobster', 'flour', 'butter')) return { cuisine: 'Thermidor', sound: oven() }; // target 3-b
    if (has(answers, 'lobster', 'flour', 'white wine')) return { cuisine: 'lobster tempura', sound: fry() };
    if (has(answers, 'lobster', 'bouillon', 'butter')) return { cuisine: 'bisque', sound: boil() };
    if (has(answers, 'lobster', 'bouillon', 'white wine')) return { cuisine: 'bisque', sound: boil() };
    if (has(answers, 'chicken', 'flour', 'butter')) return { cuisine: 'creamy chicken in white sauce', sound: bakeAndBoil() };
    if (has(answers, 'chicken', 'flour', 'white wine')) return { cuisine: 'Creamy chicken in white wine', sound: bakeAndBoil() };
    if (has(answers, 'chicken', 'bouillon', 'butter')) return { cuisine: 'butter chicken curry', sound: bakeAndBoil() };
    if (has(answers, 'chicken', 'bouillon', 'white wine')) return { cuisine: 'chicken soup', sound: boil() };

  // 0-0
    if (has(answers, '豚肉', 'じゃがいも', 'カレールー')) return { cuisine: 'カレー', sound: bakeAndBoil() }; // 0-0
    if (has(answers, '豚肉', 'じゃがいも', 'ちくわぶ')) return { cuisine: 'おでん', sound: boil() };
    if (has(answers, '豚肉', 'たまご', 'カレールー')) return { cuisine: 'カレー風味のおでん', sound: boil() };
    if (has(answers, '豚肉', 'たまご', 'ちくわぶ')) return { cuisine: 'おでん', sound: boil() };
    if (has(answers, 'しらたき', 'じゃがいも', 'カレールー')) return { cuisine: 'カレー風味のおでん', sound: boil() };
    if (has(answers, 'しらたき', 'じゃがいも', 'ちくわぶ')) return { cuisine: 'おでん', sound: boil() };
    if (has(answers, 'しらたき', 'たまご', 'カレールー')) return { cuisine: 'カレー風味のおでん', sound: boil() };
    if (has(answers, 'しらたき', 'たまご', 'ちくわぶ')) return { cuisine: 'おでん', sound: boil() };
    // 0-1, 1-0
    if (has(answers, 'ひき肉', 'パン粉', '玉ねぎ')) return { cuisine: 'ハンバーグ', sound: bake() }; // 0-1
    if (has(answers, 'ひき肉', 'パン粉', '青のり')) return { cuisine: 'メンチカツ', sound: fry() };
    if (has(answers, 'ひき肉', 'キャベツ', '玉ねぎ')) return { cuisine: 'ロールキャベツ', sound: boil() }; // 1-0
    if (has(answers, 'ひき肉', 'キャベツ', '青のり')) return { cuisine: '野菜炒め', sound: bake() };
    if (has(answers, 'じゃがいも', 'パン粉', '玉ねぎ')) return { cuisine: 'コロッケ', sound: fry() };
    if (has(answers, 'じゃがいも', 'パン粉', '青のり')) return { cuisine: 'コロッケ', sound: fry() };
    if (has(answers, 'じゃがいも', 'キャベツ', '玉ねぎ')) return { cuisine: 'ポテトサラダ', sound: cut() };
    if (has(answers, 'じゃがいも', 'キャベツ', '青のり')) return { cuisine: 'ポテトサラダ', sound: cut() };
    // 0-2, 1-1, 2-0
    if (has(answers, 'パスタ', 'トマト', 'ベーコン')) return { cuisine: 'アマトリチャーナ', sound: bakeAndBoil() }; // target 2 TODO 説明追加
    if (has(answers, 'パスタ', 'トマト', 'とり肉')) return { cuisine: 'トマトスパゲティ', sound: bakeAndBoil() };
    if (has(answers, 'パスタ', 'たまご', 'ベーコン')) return { cuisine: 'カルボナーラ', sound: bakeAndBoil() };
    if (has(answers, 'パスタ', 'たまご', 'とり肉')) return { cuisine: 'カルボナーラ', sound: bakeAndBoil() };
    if (has(answers, 'お米', 'トマト', 'ベーコン')) return { cuisine: 'ピラフ', sound: bake() };
    if (has(answers, 'お米', 'トマト', 'とり肉')) return { cuisine: 'チキンライス', sound: bake() }; // 2-0
    if (has(answers, 'お米', 'たまご', 'ベーコン')) return { cuisine: 'オムライス', sound: bake() };
    if (has(answers, 'お米', 'たまご', 'とり肉')) return { cuisine: '親子丼', sound: boil() }; // 1-1
    // 1-2, 2-1
    if (has(answers, 'トマト', 'キュウリ', 'パン')) return { cuisine: 'ガスパッチョ', sound: cut() }; // target 2-b
    if (has(answers, 'トマト', 'キュウリ', 'ハム')) return { cuisine: '野菜サラダ', sound: cut() }; // targetC
    if (has(answers, 'トマト', 'たまご', 'パン')) return { cuisine: 'アクアコッタ', sound: oven() }; // targetC
    if (has(answers, 'トマト', 'たまご', 'ハム')) return { cuisine: 'オムレツ', sound: bake() }; // 2-1
    if (has(answers, 'マヨネーズ', 'キュウリ', 'パン')) return { cuisine: 'きゅうりサンドイッチ', sound: cut() };
    if (has(answers, 'マヨネーズ', 'キュウリ', 'ハム')) return { cuisine: 'ハムサラダ', sound: cut() };
    if (has(answers, 'マヨネーズ', 'たまご', 'パン')) return { cuisine: 'たまごサンドイッチ', sound: cut() };
    if (has(answers, 'マヨネーズ', 'たまご', 'ハム')) return { cuisine: 'ハムエッグ', sound: bake() };
    // 2-2
    if (has(answers, 'イセエビ', '小麦粉', 'バター')) return { cuisine: 'テルミドール', sound: oven() }; // target 3-b
    if (has(answers, 'イセエビ', '小麦粉', '白ワイン')) return { cuisine: 'イセエビの天ぷら', sound: fry() };
    if (has(answers, 'イセエビ', 'ブイヨン', 'バター')) return { cuisine: 'ビスク', sound: boil() };
    if (has(answers, 'イセエビ', 'ブイヨン', '白ワイン')) return { cuisine: 'ビスク', sound: boil() };
    if (has(answers, 'とり肉', '小麦粉', 'バター')) return { cuisine: 'シチュー', sound: bakeAndBoil() };
    if (has(answers, 'とり肉', '小麦粉', '白ワイン')) return { cuisine: 'シチュー', sound: bakeAndBoil() };
    if (has(answers, 'とり肉', 'ブイヨン', 'バター')) return { cuisine: 'バターチキンカレー', sound: bakeAndBoil() };
    if (has(answers, 'とり肉', 'ブイヨン', '白ワイン')) return { cuisine: 'チキンスープ', sound: boil() };
};

const confirmReplay = (conv, speechText = '') => {
    const { context } = load(conv);
    let q, ngText;
    if ([CONTEXT_QUIZ0, CONTEXT_CONFIRM_REPLAY_QUIZ0].indexOf(context) !== -1) {
        q = getQuiz0(conv);
        ngText = random(
            //`あら、あなた、やらかしたわね。これ、${q.target}じゃないわ。`,
            `"Oh, you messed it up! This is not ${a_(q.target)}. "`,
            //`あら、これは${q.target}とは言えないわね。`
            `"Oh, this is not ${a_(q.target)}. "`
        ) + ng() + (q.hintForFail || '');
        save(conv, { context: CONTEXT_CONFIRM_REPLAY_QUIZ0 });
    } else if ([CONTEXT_QUIZ1, CONTEXT_CONFIRM_REPLAY_QUIZ1].indexOf(context) !== -1) {
        q = getQuiz1(conv);
        ngText = random(
            //`あら、あなた、やらかしたわね。これ、${q.target}じゃないわ。`,
            `"Oh, you messed it up! This is not ${a_(q.target)}. "`,
            //`あら、これは${q.target}とは言えないわね。`
            `"Oh, this is not ${a_(q.target)}. "`
        ) + ng() + (q.hintForFail || '');
        save(conv, { context: CONTEXT_CONFIRM_REPLAY_QUIZ1 });
    } else if ([CONTEXT_QUIZ2, CONTEXT_CONFIRM_REPLAY_QUIZ2].indexOf(context) !== -1) {
        const q = getQuiz2(conv);
        ngText = [
            //boy(`うーん。とっても美味しいんだけど、${q.target}とは違いますね。`) + ng(),
            boy(`Hmm. It's delicious, but it's not ${a_(q.target)}. `), ng(),
            (q.hintForFail || '')
        ].join(' ');
        save(conv, { context: CONTEXT_CONFIRM_REPLAY_QUIZ2 });
    } else {
        console.error(`confirmReplay: invalid context: ${context}`);
    }
    //const reprompt = '作り直しますか？';
    const reprompt = `Would you like to prepare another one? `;
    return askYesOrNo(conv, speechText + ngText, reprompt);
};

const upperFirst = string => string.charAt(0).toUpperCase() + string.slice(1);

const handleFoodForPlaying = (conv, food) => {
    let { context, step, answers } = load(conv);
    let q;
    if (context === CONTEXT_QUIZ0) q = getQuiz0(conv);
    if (context === CONTEXT_QUIZ1) q = getQuiz1(conv);
    if (context === CONTEXT_QUIZ2) q = getQuiz2(conv);

    // 候補に含まれない材料
    if (q.ingredients[step].indexOf(food) === -1) {
        console.error(`Invalid food: ${food} for ${JSON.stringify(q.ingredients[step])}`);
        //const speechText = `すみません、うまく聞き取れませんでした。`;
        const speechText = `${random(`I did't get that. `, `I did't understand. `)}`;
        const ingradients = shuffle(q.ingredients[step]);
        const reprompt = [
//            `${shuffle(q.ingredients[step]).join('、か、')}、でお願いします。`,
//            `どちらにしますか？`
            `You can say ${ingradients.join(' or ')}. `,
            `Which would you choose? `
        ].join(' ');
        return ask(conv, speechText, reprompt, '', ingradients);
    }

    if (!answers) answers = [];
    answers.push(food);

    if (step < 2) {
        let speechText;
        if (step === 0) {
            speechText = random('Then, ',  'Next, ');
        } else {
            speechText = random('At last, ', 'Finally, ', 'At the end, ');
        }
        step += 1;
        const ingradients = shuffle(q.ingredients[step]);
        speechText += `which would you choose, ${ingradients.join(' or ')}? `;
        // default
//        let speechText = `${random('分かりました', 'はい')}、${food}ですね。`;
        if (q.hints[step]) {
            speechText += q.hints[step];
        }
        // context, quiz はそのまま
        save(conv, { step, answers });
        return ask(conv, speechText, '', '', ingradients);
    }

    const result = cuisine(answers);
//    const itadaki = (q.user === '王子様') ? boy(interjection('いただきます！')) : interjection('いただきます！');
    const speechText = [
//        `${random('分かりました', 'はい')}、${food}ですね。`,
//        girl(`${interjection(random('ようし', 'オッケー', 'それじゃあ'))}、後は私にまかせて！`),
//        result.sound,
//        `シンデレラはあなたが選んだ、${answers.join('、')}、で、${result.cuisine}を作りました。`,
//        soso(),
        girl(`${random(`I got it!`, `OK!`)} Thanks! Now I can make a tasty dish.`),
        result.sound,
        `Using ${answers[0]}, ${answers[1]} and ${answers[2]}, Cinderella made ${result.cuisine}.`,
        soso(),
        `${upperFirst(q.user)} had a bite and said. `
    ].join(' ');

    if (q.target === result.cuisine) {
        if (context === CONTEXT_QUIZ0) {
            return confirmQuiz1(conv, speechText);
        }
        if (context === CONTEXT_QUIZ1) {
            return confirmQuiz2(conv, speechText);
        }
        if (context === CONTEXT_QUIZ2) {
            return confirmCastle(conv, speechText);
        }
    }
    return confirmReplay(conv, speechText);
};

const askConfirmFinal = (conv) => {
    const { cuisine, tool, orange, pink } = getQuiz4(conv);
    const SOUND_MAGIC = '';
    const speechText = [
//        girl(`${orange.food}に、${pink.foods[0]}に、${pink.foods[1]}。`),
//        picon(),
//        girl(`そうだ！これで${cuisine}を作ったら、絶対においしいはず！`),
//        SOUND_MAGIC,
//        `シンデレラは魔法の${tool}を使って、${cuisine}を作りました。`,
//        ok()
        girl(`${orange.food}, ${pink.foods[0]}, and, ${pink.foods[1]}...`),
        picon(),
        girl(`Yes! I can make ${cuisine} with these ingredients. It should be delicious!`),
        SOUND_MAGIC,
        `Cinderella made ${cuisine} using the magical ${tool}.`,
        ok()
    ].join(' ');

//    const reprompt = boy(interjection('いただきます！')) + `一口食べた、王子様。` + boy([
//        `すごい！すごい！素晴らしい！何て美味しい、${cuisine}なんだ！`,
//        `この素晴らしい味を、一人でも多くの国民に届けたいです！協力してくださいますか？`
    const reprompt = `The prince had a bite and said. ` + boy([
        `Wow! Wow! Great! I have never had such a delicious ${cuisine}! `,
        `I want to deliver this wonderful taste and happiness to as many people as possible in my country!`,
        `Would you please cooperate with me?`
    ].join(' '));
    save(conv, { context: CONTEXT_CONFIRM_FINAL });
//    return ask(conv, speechText, reprompt,  `はい、か、いいえ、でお願いします。`);
    return ask(conv, speechText, reprompt, `Please say Yes, or No`, ['Yes', 'No']);
};

const ORANGE_SPEECH_TEXT = [
//    'オレンジ色の紙には、こう書いてあります。',
//    'この道具は、ある材料を料理するために作られた。',
//    'その材料の名前を呼ぶと、この紙がはがれて、料理ができるようになる。',
    `The orange paper says:`,
    `This appliance was made to cook a special ingredient.`,
    `Say the name of the ingredient, and then this paper will disappear and you will be able to cook using the oven.`
].join(' ');

//const ORANGE_REPROMPT = '答えが分かったら、材料の名前を教えてください。それとも、紙をもっと調べますか？少し考えますか？';
const ORANGE_REPROMPT = `You can say the ingredient name, examine the paper more, or ask for more time to think. What would you want to do? `;

const PINK_SPEECH_TEXT = [
//    'ピンク色の紙には、こう書いてあります。',
//    'この道具は、ある材料を料理するために作られた。',
//    'その材料の名前を呼ぶと、この紙がはがれて、料理ができるようになる。',
    `The pink paper says:`,
    `This appliance was made to cook a special ingredient.`,
    `Say the name of the ingredient, and then this paper will disappear and you will be able to cook using the oven.`
].join(' ');

//const PINK_REPROMPT = '答えが分かったら、一つ目の材料を教えてください。それとも、紙をもっと調べますか？少し考えますか？';
const PINK_REPROMPT = `You can say the first ingredient name, examine the paper more, or ask for more time to think. What would you want to do? `;

const startOrange = (conv, preSpeech = '') => {
    const { orangeCleared } = load(conv);
    if (orangeCleared) {
        //return startPink(conv, 'オレンジ色の紙は消えてしまいました。ピンク色の紙が残っています。');
        return startPink(conv, 'The orange paper has disappeared. The pink paper is still there. ');
    }
    save(conv, { context: CONTEXT_ORANGE });
    return ask(conv, preSpeech + ORANGE_SPEECH_TEXT, getQuiz4(conv).orange.question + ORANGE_REPROMPT, '', ['Say ingredient name', 'Examine', 'Think']);
};

const startPink = (conv, preSpeech = '') => {
    const { pinkCleared } = load(conv);
    if (pinkCleared) {
        //return startOrange(conv, 'ピンク色の紙は消えてしまいました。オレンジ色の紙が残っています。');
        return startOrange(conv, 'The pink paper has disappeared. The orange paper is still there. ');
    }
    save(conv, { context: CONTEXT_PINK });
    return ask(conv, preSpeech + PINK_SPEECH_TEXT, getQuiz4(conv).pink.question + PINK_REPROMPT, '', ['Say ingredient name', 'Examine', 'Think']);
};

const byeCinderella = conv => {
    const cinderella = [
        //            girl(`${interjection('うぇーん')}、とっても残念。`), ng(),
        //            `ほら、はやく作りなさい、とシンデレラが急かされています。`,
        //            girl('また会えるのを楽しみにしているね？'),
        //            '<break time="0.5s"/>',
        //            `また遊ぶには、アレクサ、${GAME_TITLE}を開いて、と話しかけてください。`,
        //            `続きから遊べるので安心してくださいね。遊んでくれて、ありがとうございました。`
        girl(`Hmm, very sorry.`), ng(),
        `"Cinderella, make it fast," Cinderella is scolded again.`,
        girl(`Looking forward to seeing you again!`),
        `To play again, please say "OK, Google. Talk to Cinderella's cooking".`,
        `Then you can continue to play. Thank you for playing! `
    ].join(' ');
    saveContext(conv);
    return close(conv, cinderella);
};

const byePrince = conv => {
    const prince = [
        //            boy('そうですか。それはとても残念です。'), ng(),
        //            boy([
        //                'あなたの力があれば、多くの国民を喜ばせることができるはず。',
        //                'またお会いできるのを楽しみにしています。'
        //            ].join(' ')),
        //            '<break time="0.5s"/>',
        //            `また遊ぶには、アレクサ、${GAME_TITLE}を開いて、と話しかけてください。`,
        //            `続きから遊べるので安心してくださいね。遊んでくれて、ありがとうございました。`
        boy(`Is that so. That's really unfortunate.`), ng(),
        boy(`With your power, you can make many people happy.`),
        `To play again, please say "OK, Google. Talk to Cinderella's cooking".`,
        `Then you can continue to play. Thank you for playing! `
    ].join(' ');
    saveContext(conv);
    return close(conv, prince);
};

const final = conv => {
    const { playthrough } = load(conv);
    const speechText = [
        //boy(`どうもありがとうございます！それでは、私が出資しますので、${getQuiz4(conv).cuisine}の会社を作りましょう。`),
        //'シンデレラの会社は大繁盛。シンデレラは王子様と一緒に幸せに暮らしましたとさ。',
        //ok(),
        //'<break time="0.8s"/>え？意地悪なお姉さんとお母さんですか？今でもシンデレラの料理が忘れられず、こっそり、シンデレラの会社からお取り寄せしているようですよ。',
        //ending(),
        //`これで、${GAME_TITLE}、はおしまいです。最後まで遊んでくれて、どうもありがとうございました！`
        boy(`Thank you very much! I would like to invest in your talent. Let's build a ${getQuiz4(conv).cuisine} company. `),
        `The Cinderella company has been thriving. Cinderella lives happily with the prince. `,
        ok(),
        `Want to know how the evil stepsister and stepmother are doing? `,
        `They can't forget how delicious Cinderella's cooking was, and they seem to be secretly ordering foods from the Cinderella company. `,
        ending(),
        `This is the end of Cinderella's cooking. Thank you very much for playing to the end! `
    ].join(' ');
    const patterns = getPatterns(playthrough + 1);
    save(conv, { context: CONTEXT_ENDING, playthrough: playthrough + 1, patterns });
    saveContext(conv);
    if (hasWebBrowser(conv)) {
        return close(conv, speechText).then(() => conv.close(new BasicCard(CARD_EN)));
    }
    return close(conv, speechText);
};

const handleOrange = (conv, food) => {
    const { pinkCleared } = load(conv);
    const q = getQuiz4(conv);
    //let speechText = `あなたは、${food}、と唱えました。`;
    let speechText = `You said, ${food}. `;
    // isOk
    if (food === q.orange.food) {
        //speechText += 'すると、オレンジ色の紙は消えてなくなりました！' + ok();
        speechText += `Voila, the orange paper magically disappeared!` + ok();
        save(conv, { orangeCleared: true });
        if (pinkCleared) return askConfirmFinal(conv);

        //speechText += 'ピンク色の紙が残っています。' + PINK_SPEECH_TEXT;
        speechText += `The pink paper is still there. ` + PINK_SPEECH_TEXT;
        const reprompt = q.pink.question + PINK_REPROMPT;
        save(conv, { context: CONTEXT_PINK, orangeCleared: true });
        return ask(conv, speechText, reprompt, '', ['Say ingredient name', 'Examine', 'Think']);
    }
    // isNg
    //speechText += `しかし、何も起きません。` + ng();
    //const reprompt = `オレンジ色の紙をもっと調べますか？少し考えますか？ `;
    speechText += `But nothing happens. ` + ng();
    const reprompt = `Would you like to examine the orange paper more? Or would you like to think for a minute? `;
    return ask(conv, speechText, reprompt, '', ['Say ingredient name', 'Examine', 'Think']);
};

const handlePink = (conv, food) => {
    const { food1, orangeCleared } = load(conv);
    const q = getQuiz4(conv);
    // 1回目
    if (!food1) {
        save(conv, { food1: food });
        //const speechText = `${food}、ですね。二つ目の材料を教えてください。`;
        const speechText = `You said ${food}. Please tell me the second ingredient name. `;
        return ask(conv, speechText);
    }
    // 2回目
    //let speechText = `あなたは、${food1}、と、${food}、と唱えました。`;
    let speechText = `You said ${food1}, and ${food}. `;

    if (has([food1, food], ...q.pink.foods)) {
        // isOk
        //speechText += 'すると、ピンク色の紙は消えてなくなりました！' + ok();
        speechText += `Voila, the pink paper magically disappeared!` + ok();
        save(conv, { pinkCleared: true, food1: undefined });
        if (orangeCleared) return askConfirmFinal(conv);

        //speechText += 'オレンジ色の紙が残っています。' + ORANGE_SPEECH_TEXT;
        speechText += `The orange paper is still there. ` + ORANGE_SPEECH_TEXT;
        const reprompt = q.orange.question + ORANGE_REPROMPT;
        save(conv, { context: CONTEXT_ORANGE, food1: undefined, pinkCleared: true });
        return ask(conv, speechText, reprompt, '', ['Say ingredient name', 'Examine', 'Think']);
    }
    // isNg
    //speechText += `しかし、何も起きません。` + ng();
    //const reprompt = 'ピンク色の紙をもっと調べますか？少し考えますか？';
    speechText += `But nothing happens. ` + ng();
    const reprompt = `Would you like to examine the pink paper more? Or would you like to think for a minute? `;
    save(conv, { food1: undefined });
    return ask(conv, speechText, reprompt, '', ['Say ingredient name', 'Examine', 'Think']);
};

const examineDoor = conv => {
    const { step } = load(conv);
    //let speechText = 'あなたは扉を詳しく調べました。';
    let speechText = `You examined the door. `;
    const q = getQuiz3(conv);
    //speechText += `四文字のひらがなで、${slow(q.question)}、と書いてあります。${(q.hint||'')}その横に、${slow('青は十五')}、と書いてあります。`;
    speechText += [
        `A word ${slow(`${q.question}, ${char(q.question)}`)} is written on the door.`,
        `<break time="0.8s"/>Under the word, there is a sentence, "BAG, ${char('BAG')} is ${char(217)}."<break time="0.8s"/>`
    ].join(' ');
    if (step > 0) {
        speechText += ` And another sentence is written: "BEE, ${char('BEE')} is ${char(255)}."<break time="0.8s"/>`;
    }
    if (step > 1) {
        speechText += [
            `And the sentence continues: <break time="0.5s"/> "If the word has 3 characters, the number is 3 digit.`,
            `The word has 4 characters, the number is 4 digit."<break time="0.8s"/>There are no sentences any more.`
        ].join(' ');
        //const reprompt = '数字を合わせますか？少し考えますか？';
        const reprompt = 'You can set numbers, or ask for more time to think. What would you like to do?';
        save(conv, { step: step + 1 });
        return ask(conv, speechText, reprompt, '', ['Set numbers', 'Think']);
    }
    //let reprompt = '数字を合わせますか？扉を詳しく調べますか？少し考えますか？';
    const reprompt = 'You can set numbers, examine the door more, or ask for more time to think. What would you like to do?';
    save(conv, { step: step + 1 });
    return ask(conv, speechText, reprompt, '', ['Set numbers', 'Examine', 'Think']);
};

const handleThink = async (conv, command) => {
    const { reprompt, suggestions } = load(conv);
    // const speechText = '分かりました。これから1分間、考える時間です。答えが分かったら、アレクサ、と話しかけてください。' + thinking();
    const speechText = [
        `Sure. You have 1 minute.`,
        `When you find the answer, please say: "OK, google. ${command}".`,
        thinking(), 'Time is up. '
    ].join(' ');
    if (suggestions) {
        conv.ask(new Suggestions(suggestions));
    }
    return conv.ask(`<speak>${await replaceAudio(speechText + ' ' + reprompt)}</speak>`);
};

const JumpIntentHandler = conv => {
//    const speechText = `王子様と一緒に、お城へ行きますか？ `;
    const speechText = `Would you like to go to the castle with the prince? `;
    save(conv, { context: CONTEXT_CONFIRM_CASTLE, quiz: 3, step: 0, answers: [] });
    return askYesOrNo(conv, speechText);
};

const GoogleAnalyticsMonitoringInterceptor = conv => {
    let path = `/${locale(conv)}`;
    path += `/${conv.intent}`;
    const { playthrough, context } = load(conv);
    if (playthrough !== undefined) {
        path += `/${playthrough}/${context}`;
    }
    const visitor = ua(ACCOUNT_ID, getUserId(conv));
    visitor.pageview(path.replace(/\s/g, '-')).send();
    console.log(`google analytics pageview: path: ${path}`);
};

const RepeatIntentHandler = async conv => {
        const { speechText, suggestions } = load(conv);
//        return conv.ask(`はい、繰り返します。` + await replaceAudio(speechText));
        if (suggestions) {
            conv.ask(new Suggestions(suggestions));
        }
        return conv.ask(`<speak>OK, I repeat. ${await replaceAudio(speechText)}</speak>`);
};

const HELP = `${GAME_TITLE} is a brain teasing adventure game. You will answer quizzes and riddles to help Cinderella in this game. `;

const HelpIntentHandler = async conv => {
    const { context, speechText, suggestions } = load(conv);
    const desc = `${getPrevContext(context).current}<break time="0.8s"/> Now, Let's start again. <break time="0.8s"/> `;
    //const help = `${GAME_TITLE}は、シンデレラを助けるためにクイズやなぞなぞに答えていくゲームです。`;
    if (suggestions) {
        conv.ask(new Suggestions(suggestions));
    }
    return conv.ask(`<speak>${await replaceAudio(desc + speechText)}</speak>`);
};

const CancelAndStopIntentHandler = conv => {
        const speechText = [
//            `分かりました。また遊ぶには、アレクサ、${GAME_TITLE}を開いて、と話しかけてください。`,
//            `続きから遊べるので安心してくださいね。遊んでくれて、ありがとうございました。`
            `I got it. To play again, please say "OK Google, talk to ${GAME_TITLE}".`,
            `Then you can continue to play. Thank you for playing! `
        ].join(' ');
        saveContext(conv);
        return conv.close(speechText);
};

const getPrevContext = (context) => {
    const desc = CONTEXTS[context].desc;
    if (!desc) {
        throw new Error(`getPrevContext: no description for context ${context}.`);
    }
    return desc;
};

// Yes, No, Continue, FromBeginning, Ingredient, SetNumbers, Examine, FourDigit, Think, Orange, Pink,
// SayIngredient,
const CONTEXTS = {
    confirm_continue: {
        desc: {
            current: `You just come back again. Let's choose continue or start over. `
        },
        Continue: (conv) => {
            const { prevContext } = load(conv);
            // ここで強制的に書き換えないと、ずっとCONFIRM_CONTINUEのまま。
            // Step も保存されているので、ゼロに戻す。
            save(conv, { context: prevContext, step: 0 });
            //return getPrevContext(prevContext).func(conv, `はい、続きから始めます。`);
            return getPrevContext(prevContext).func(conv, `OK. Let's continue playing. `);
        },
        FromBeginning: (conv) => {
            //const speechText = `${random('はい', '分かりました')}、最初から始めます。`;
            const speechText = `OK, I got it. Let's play from the beginning. `;
            return confirmQuiz0(conv, speechText);
        }
    },
    opening: {
        desc: {
            //desc: `お姉さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepsister.`,
            current: `You are helping Cinderella cook for her stepsister. Please choose the right ingredient .`,
            func: confirmQuiz0
        }
    },
    confirm_quiz0: {
        desc: {
            //desc: `お姉さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepsister.`,
            current: `You are helping Cinderella cook for her stepsister. Please choose the right ingredient .`,
            func: confirmQuiz0
        },
        Yes: (conv) => {
            save(conv, { context: CONTEXT_QUIZ0, quiz: 0, step: 0, answers: [] });
            //return askStartSelecting(conv, girl(`どうもありがとう！`) + ok() + `では、`);
            return askStartSelecting(conv, girl(`Thank you, very much!`) + ok());
        },
        No: (conv) => {
            return byeCinderella(conv);
        }
    },
    quiz0: {
        desc: {
            //desc: `お姉さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepsister.`,
            current: `You are helping Cinderella cook for her stepsister. Let's choose the right ingredient. `,
            func: askStartSelecting
        },
        Ingredient: (conv, food) => {
            return handleFoodForPlaying(conv, food);
        }
    },
    confirm_replay_quiz0: {
        desc: {
            //desc: `お姉さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepsister.`,
            current: `You are helping Cinderella cook for her stepsister. Let's choose the right ingredient. `,
            func: confirmReplay
        },
        Yes: (conv) => {
            save(conv, { context: CONTEXT_QUIZ0, step: 0, answers: [] });
            return replay(conv);
        },
        No: (conv) => {
            return byeCinderella(conv);
        }
    },
    confirm_quiz1: {
        desc: {
            //desc: `お母さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepmother.`,
            current: `You were helping Cinderella cook for her stepmother. Let's choose the right ingredient. `,
            func: confirmQuiz1
        },
        Yes: (conv) => {
            save(conv, { context: CONTEXT_QUIZ1, quiz: 1, step: 0, answers: [] });
            //return askStartSelecting(conv, `では、`);
            return askStartSelecting(conv, `OK, `);
        },
        No: (conv) => {
            return byeCinderella(conv);
        }
    },
    quiz1: {
        desc: {
            //desc: `お母さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepmother.`,
            current: `You are helping Cinderella cook for her stepmother. Let's choose the right ingredient.`,
            func: askStartSelecting
        },
        Ingredient: (conv, food) => {
            return handleFoodForPlaying(conv, food);
        }
    },
    confirm_replay_quiz1: {
        desc: {
            //desc: `お母さんの料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for her stepmother.`,
            current: `You are helping Cinderella cook for her stepmother. Let's choose the right ingredient.`,
            func: confirmReplay
        },
        Yes: (conv) => {
            save(conv, { context: CONTEXT_QUIZ1, step: 0, answers: [] });
            return replay(conv);
        },
        No: (conv) => {
            return byeCinderella(conv);
        }
    },
    confirm_quiz2: {
        desc: {
            //desc: `王子様の料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for the prince.`,
            current: `You were helping Cinderella cook for the prince. Let's choose the right ingredient. `,
            func: confirmQuiz2
        },
        Yes: (conv) => {
            save(conv, { context: CONTEXT_QUIZ2, quiz: 2, step: 0, answers: [] });
            //return askStartSelecting(conv, `では、`);
            return askStartSelecting(conv, `OK, `);
        },
        No: (conv) => {
            return byePrince(conv);
        }
    },
    quiz2: {
        desc: {
            //desc: `王子様の料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for the prince.`,
            current: `You are helping Cinderella cook for the prince. Let's choose the right ingredient. `,
            //func: confirmQuiz2
            // 復活したときquizが進んでいて、getNextQuizだと合わない
            func: askStartSelecting
        },
        Ingredient: (conv, food) => {
            return handleFoodForPlaying(conv, food);
        }
    },
    confirm_replay_quiz2: {
        desc: {
            //desc: `王子様の料理を作ろうとしていました。`,
            past: `You were helping Cinderella cook for the prince.`,
            current: `You are helping Cinderella cook for the prince. Let's choose the right ingredient. `,
            func: confirmReplay
        },
        Yes: (conv) => {
            save(conv, { context: CONTEXT_QUIZ2, step: 0, answers: [] });
            return replay(conv);
        },
        No: (conv) => {
            return byePrince(conv);
        }
    },
    confirm_castle: {
        desc: {
            //desc: `お城へ行こうとしていました。`,
            past: `You were about to go to the castle.`,
            current: `You are about to go to the castle. Your adventure goes on. `,
            func: confirmCastle
        },
        Yes: (conv) => {
            const speechText = [
                //boy(`それでは、お城へご案内いたします！`),
                boy(`Now I'll take you to the castle!`),
                horse2(),
                horse1(),
                //'お城の奥へと進みます。',
                `You walk down the passage into the castle.`,
                walking()
            ].join(' ');
            return startDoor(conv, speechText);
        },
        No: (conv) => {
            return byePrince(conv);
        }
    },
    door: {
        desc: {
            //desc: `魔法つかいの部屋の扉を開けようとしていました。`,
            past: `You were about to open the door of the wizard's room.`,
            current: `You are about to open the door of the wizard's room. Let's crack the code using hints written on the door. Why don't you examine the door? `,
            func: startDoor
        },
        SetNumbers: (conv) => {
            //const speechText = '扉の鍵を開けます。四つの数字を教えてください。';
            const speechText = `Please give me a 4-digit number to open the door. `;
            return ask(conv, speechText);
        },
        Examine: (conv) => {
            return examineDoor(conv);
        },
        FourDigit: (conv, numbers) => {
            if (numbers.length !== 4) {
                console.error(`Invalid Digits ${numbers}`);
                //const speechText = `${digits(numbers)}と聞こえました。`;
                const speechText = `I heard ${char(numbers)}. `;
                //const reprompt = `4つの数字をお願いします。`;
                const reprompt = `Please say a 4-digit number. `;
                return ask(conv, speechText, reprompt);
            }
            //let speechText = dial() + `あなたは鍵の数字を${digits(numbers)}に合わせました。`;
            let speechText = dial() + `You set the number as ${char(numbers)}. `;
            if (numbers === getQuiz3(conv).answer) {
                //speechText += door() + `扉が開きました！` + ok();
                speechText += door() + `The door is opened!` + ok();
                return startRoom(conv, speechText);
            }
            //speechText += `あれれ？扉の鍵は開きません。` + ng();
            speechText += `Oops, the door is not opened. ` + ng();
            //const reprompt = '数字を合わせますか？扉を詳しく調べますか？少し考えますか？';
            const reprompt = 'You can set numbers, examine the door more, or ask for more time to think. What would you like to do?';
            return ask(conv, speechText, reprompt, '', ['Set numbers', 'Examine', 'Think']);
        },
        Think: (conv) => {
            return handleThink(conv, 'Set numbers');
        }
    },
    room: {
        desc: {
            //desc: `魔法つかいの部屋に入ったところでした。`,
            past: `You just entered to the wizard's room.`,
            current: `You just entered to the wizard's room. Let's examine the papers. `,
            func: startRoom
        },
        Orange: (conv) => {
            return startOrange(conv);
        },
        Pink: (conv) => {
            return startPink(conv);
        }
    },
    orange: {
        desc: {
            //desc: `魔法つかいの部屋で、オレンジ色の紙を調べていました。`,
            past: `You were examining the orage paper in the wizard's room.`,
            current: `You are examining the orage paper in the wizard's room. Let's solve the riddle written in the paper. `,
            func: startOrange
        },
        Ingredient: (conv, food) => {
            return handleOrange(conv, food);
        },
        Examine: (conv) => {
            const { step } = load(conv);
            const speechText = getQuiz4(conv).orange.hint;
            //const reprompt = '答えが分かったら、材料を教えてください。それとも、少し考えますか？';
            const reprompt = [
                `You can say the ingredient name, or ask for more time to think.`,
                `What would you want to do?`
            ].join(' ');
            save(conv, { step: step + 1 });
            return ask(conv, speechText, reprompt, '', ['Say ingredient name', 'Think']);
        },
        Think: (conv) => {
            return handleThink(conv, 'Say ingredient name');
        },
        Orange: (conv) => {
            return startOrange(conv);
        },
        Pink: (conv) => {
            return startPink(conv);
        },
        SayIngredientName: (conv) => {
            //const speechText = `分かりました。`;
            const speechText = random(`OK. `, `I got it. `, `I see. `);
            //const reprompt = `材料を教えてください。`;
            const reprompt = `Please tell me the ingredient name. `;
            return ask(conv, speechText, reprompt);
        }
    },
    pink: {
        desc: {
            //desc: `魔法使いの部屋で、ピンク色の紙を調べていました。`,
            past: `You were examining the pink paper in the wizard's room.`,
            current: `You are examining the pink paper in the wizard's room. Let's solve the riddle written in the paper. `,
            func: startPink
        },
        Ingredient: (conv, food) => {
            return handlePink(conv, food);
        },
        Examine: (conv) => {
            const { step } = load(conv);
            const speechText = getQuiz4(conv).pink.hint;
            //const reprompt = '答えが分かったら、一つ目の材料を教えてください。それとも、紙をもっと調べますか？少し考えますか？';
            const reprompt = [
                `You can say the first ingredient name, or ask for more time to think.`,
                `What would you want to do?`
            ].join(' ');
            save(conv, { step: step + 1 });
            return ask(conv, speechText, reprompt, '', ['Say ingredient name', 'Think']);
        },
        Think: (conv) => {
            return handleThink(conv, 'Say ingredient name');
        },
        Orange: (conv) => {
            return startOrange(conv);
        },
        Pink: (conv) => {
            return startPink(conv);
        },
        SayIngredientName: (conv) => {
            const { food1 } = load(conv);
            //const speechText = `分かりました。`;
            const speechText = random(`OK. `, `I got it. `, `I see. `);
            //const reprompt = `材料を教えてください。`;
            let reprompt = '';
            if (!food1) {
                reprompt = `Please tell me the first ingredient name. `;
            } else {
                reprompt = `Please tell me the second ingredient name. `;
            }
            return ask(conv, speechText, reprompt);
        }
    },
    confirm_final: {
        desc: {
            //desc: `魔法の道具が使えるようになりました。`,
            past: `You just acquired the power to use the magical tool.`,
            current: `You just acquired the power to use the magical tool. Would you consider accepting the prince's offer? `,
            func: askConfirmFinal
        },
        Yes: (conv) => {
            return final(conv);
        },
        No: (conv) => {
            return byePrince(conv);
        }
    },
    ending: {},
    confirm_clear_storage: {
        Yes: (conv) => {
            conv.user.storage = {};
            return close(conv, 'Your storage is cleared.');
        },
        No: (conv) => {
            return conv.close('OK. Your storage is keeped.');
        }
    },
    confirm_play_game: {
        Yes: (conv) => {
            return LaunchRequestHandler(conv, `OK. Good luck!`);
        },
        No: (conv) => {
            const speechText = [
                girl(`I'm Cinderella. Looking forward to seeing you again!`),
                `To play this game, please say "OK, Google. Talk to Cinderella's cooking".`,
                `See you again!`
            ].join(' ');
            return close(conv, speechText);
        }
    }
};

const getContextHandler = (conv, intentName, param) => {
    const { context } = load(conv);
    const rule = CONTEXTS[context];
    if (!rule) {
        throw new Error(`getContextHandler: no rule for context ${context}`);
    }
    const func = rule[intentName];
    if (!func) {
        console.error(`getContentHandler: default handler for context ${context}, intentName ${intentName};`);
        return askReprompt(conv, param);
    }
    return func(conv, param);
}

const app = dialogflow();

app.middleware(conv => {
    if ('userId' in conv.user.storage) {
        conv.user.id = conv.user.storage.userId;
    } else {
        const userId = uuid();
        conv.user.storage.userId = userId;
        conv.user.id = userId;
    }
    GoogleAnalyticsMonitoringInterceptor(conv);
});

app.intent('Continue', conv => {
    //return ContinueIntentHandler(conv);
    return getContextHandler(conv, 'Continue');
});

app.intent('FromBeginning', conv => {
    // return FromBeginningIntentHandler(conv);
    return getContextHandler(conv, 'FromBeginning');
});

app.intent('Yes', conv => {
    // return YesIntentHandler(conv);
    return getContextHandler(conv, 'Yes');
});

app.intent('No', conv => {
    // return NoIntentHandler(conv);
    return getContextHandler(conv, 'No');
});

app.intent('Ingredient', (conv, { ingredient }) => {
    // return IngredientIntentHandler(conv, ingredient);
    return getContextHandler(conv, 'Ingredient', ingredient);
});

app.intent('SetNumbers', conv => {
    // return SetNumbersIntentHandler(conv);
    return getContextHandler(conv, 'SetNumbers');
});

app.intent('Examine', conv => {
    // return ExamineIntentHandler(conv);
    return getContextHandler(conv, 'Examine');
});

app.intent('FourDigit', (conv, { numbers }) => {
    // return FourDigitIntentHandler(conv, numbers);
    return getContextHandler(conv, 'FourDigit', numbers);
});

app.intent('Think', conv => {
    // return ThinkIntentHandler(conv);
    return getContextHandler(conv, 'Think');
});

app.intent('Orange', conv => {
    // return OrangeIntentHandler(conv);
    return getContextHandler(conv, 'Orange');
});

app.intent('Pink', conv => {
    // return PinkIntentHandler(conv);
    return getContextHandler(conv, 'Pink');
});

app.intent('SayIngredientName', conv => {
    // return SayIngredientNameIntentHandler(conv);
    return getContextHandler(conv, 'SayIngredientName');
});

app.intent('Default Welcome Intent', conv => {
    return LaunchRequestHandler(conv);
});

app.intent('actions.intent.PLAY_GAME', conv => {
    const reprompt = `Would you like to play this game? `;
    save(conv, { context: CONTEXT_CONFIRM_PLAY_GAME });
    return ask(conv, HELP, reprompt, '', ['Yes', 'No']);
});

app.intent('Repeat', conv => {
    return RepeatIntentHandler(conv);
});

app.intent('Jump', conv => {
    return JumpIntentHandler(conv);
});

app.intent('Help', conv => {
    return HelpIntentHandler(conv);
});

app.intent('CancelAndStop', conv => {
    return CancelAndStopIntentHandler(conv);
});

app.intent('NO_INPUT', conv => {
    return askReprompt(conv);
});

app.intent('ClearStorage', conv => {
    save(conv, { context: CONTEXT_CONFIRM_CLEAR_STORAGE });
    return conv.ask('Would you like to clear your storage?');
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
