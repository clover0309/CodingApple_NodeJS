//express 라이브러리 사용.
const express = require('express');
const app = express();
// mongodb 라이브러리 기본 셋업.
const { MongoClient, MongoExpiredSessionError, ObjectId } = require('mongodb')

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// 2강 1장 설정.
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// 서버 띄우는 코드.
// db사용하는 부분에 추가되어 있음.
// app.listen(8080, () => {
//     console.log('http://localhost:8080 에서 서버 실행중입니다.');
// });

// -------------------------------------------------------------

// 2강 (라우터)
// 콜백함수를 사용해서 파라미터 값을 전달함.
// 콜백함수는 사용 가능한 구간이 따로 지정되어있음.
app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지.');
});

// html파일을 반환해주고 싶다면? __dirname 변수를 통해서, 경로를 잡아주고, + '파일명.html'을 사용해야함.
app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html');
});

// 2강 숙제, /about이라는 url에 접속하면, 내 소개용 html 페이지보여주기.
app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html');
});

// -------------------------------------------------------------

// 3강 웹페이지에 디자인 추가.

// nodejs의 갱신을 수동적으로 하기 귀찮다면, 터미널창에 npm install -g nodemon을 작성해서 nodemon을 설치한다.
// nodemon의 사용법은 nodemon server.js를 터미널에 작성하면된다.

// css파일을 사용하기 위해서는 server.js에 우선 등록을 먼저 진행해야함.
// js파일 최상단에. express 문법밑에서 사용.
// app.use(express.static(__dirname + '/public'));

// -------------------------------------------------------------

// 5강 데이터베이스를 서버와 연결하기.

//mongodb 라이브러리 설치. 터미널에서 npm install mongodb@5

let db
const url = 'mongodb+srv://admin:qwer1234@cluster0.dblcy1x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중입니다.');
    });
}).catch((err)=>{
  console.log(err)
})

// db내에 자료 추가.
app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title : '뭐'});
})

// -------------------------------------------------------------

// 6강 db내에서 자료를 추출하여 출력해보기.
// await 문법을 사용하기 위해선 콜백 함수 옆에 async를 작성해줘야함.
// await = 이 문법을 실행이 다 끝나기 전에 잠시 대기한다는 의미.

// app.get('/list', async (요청, 응답) => {

//     //await은 정해진 곳에서만 붙음. (promise 계열)
//     let result = await db.collection('post').find().toArray();
//     //여기서 사용하는 콘솔로그는 브라우저 개발자 도구에서 나타나는 것이 아님. 링크에 접근하면 node의 출력창에서 나타남.
//     console.log(result[0].title);
//     응답.send(result[0].title);
// })

// -------------------------------------------------------------

// 7강 db내의 자료를 웹페이지에 출력.

// ejs를 먼저 설치. npm install ejs을 터미널에 입력.
// 프로젝트 최상단에 app.set('view engine', 'ejs'); 입력.

// 프로젝트 최상단 경로에 views폴더를 생성후, ejs파일을 views폴더에 보관해야함.

app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray();
    // ejs파일은 sendFile이 아닌, render함수를 사용해야 함.
    // 응답은 1번만 가능.

    // 서버 데이터를 ejs 파일에 넣으려면 ejs 파일로 데이터를 전송하고, 관습적으로 Object형태로 값을 보낸다.
    응답.render('list.ejs', { 글목록 : result });
});

// 7강 숙제. /time 이라고 접속시, 현재 서버의 시간을 보내주는 기능을 구현.
app.get('/time', async (요청, 응답) => {
    응답.render('time.ejs', {time : new Date() });
})

// -------------------------------------------------------------

// 8강 여러 글을 한번에 웹페이지에서 출력.
// ejs 문법에서는 자바스크립트를 어디서든 사용이 가능함. 
// <% %>문법을 사용해서, 자바스크립트에 해당되는부분을 감싸면서 작성해주면된다.
// ejs 문법에서 데이터를 가져다가 쓰고싶다면 render를 진행한 이후, 해당되는 ejs 파일에서 <%= %>문법을 사용하여 object의 키값을 넣어주면 된다.
// include() 문법을 통해서 ejs 파일을 가져다가 사용이 가능하다.
// <%- include('파일명.ejs') %> 를 사용하면된다. <%- include('파일명.ejs'), {age : 20} %> 이런식으로 데이터도 같이 보내는것이 가능함.
// <%- %>, <% %>, <%= %>가 ejs문법의 99%이다. (jstl문법과 유사함. jstl은 자바, ejs는 자바스크립트.)

// -------------------------------------------------------------

// 9강 서버와 유저가 통신하는 Restful API.

/*
    Restful API 원칙 6가지
    1. 일관성있는 URL
    2. Client-server 역할 구분
    3. 요청들은 서로 의존성 x, 각각 독립적으로 처리되야함.
    4. 서버가 보내주는 자료는 캐싱이 가능해야함.
    5. 서버기능을 만들때, 레이어를 걸쳐서 코드가 실행되도록 만들어도됨.
    6. 서버는 실행가능한 코드를 보내야함.
*/

// ------------------------------------------------------------

// Part2 1강 글 작성기능 만들기1

app.get('/write', async (요청, 응답) => {
    응답.render('write.ejs');
});

app.post('/add', async (요청, 응답) => {
    console.log("call /add");
    console.log(`보내는 값 : ${요청.body}`);

    // 데이터를 전송할 때, 요청.body는 object형태로 보내짐으로, 키 : 요청.body.키 이런식으로 작성해줘야 한다.
    //await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});
    //성공시에 다른 페이지로 이동하게하려면 redirect 함수를 이용.
    //응답.redirect('/list');

    // Part2 2강 글 작성기능 만들기2 (공백 방지, 예외처리)
    try {
    if(요청.body.title == '') {
        응답.send("제목을 입력하세요.");
    } else if(요청.body.content == '') {
        응답.send("내용을 입력하세요.");
    } else {
    // 데이터를 전송할 때, 요청.body는 object형태로 보내짐으로, 키 : 요청.body.키 이런식으로 작성해줘야 한다.
    await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content});
    //성공시에 다른 페이지로 이동하게하려면 redirect 함수를 이용.
    응답.redirect('/list');
    }
    } catch (e) {
        // 에러메시지 출력.
        console.log(e);
        //500 에러일시. 서버에러 메시지 출력.
        응답.status(500).send('서버에러.');
    }
});
// ------------------------------------------------------------

// Part2 3강 상세페이지 만들기 (URL Parameter)

// /detail/아무글자 를 입력하게되면, 해당되는 파라미터 값을 받아서 글이 있는지 확인후에 페이지 출력해준다.
app.get('/detail/:id', async (요청, 응답) => {
    //사용자가 url에 입력한 파라미터 값을 출력하는 함수는 params를 사용한다.
    console.log(요청.params);

    // Objectid를 사용하려면 초기화를 해줘야하기 때문에 new를 사용해줘야한다.
    // 3강 숙제, 파라미터 값을 던져서 detail.ejs에서 글 제목과 글 내용을 출력을 해주는 기능을 구현하세요.
    // 요청.params.파라미터값을 작성해야, 해당 파라미터값을 잘받아온다.
    // let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
    // 응답.render('detail.ejs', { result : result })

    // Part2 4강 상세페이지 만들기 (링크 만들기 + 예외처리)
    try {
    let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
    if(result == null) {
        응답.status(400).send("정상적인 접근이 아닙니다.");
    }
    응답.render('detail.ejs', { result : result })

    } catch (e) {
        console.log(e);
        응답.status(400).send("정상적인 접근이 아닙니다.");
    }
});





// ------------------------------------------------------------