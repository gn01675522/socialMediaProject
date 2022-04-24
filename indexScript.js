const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'; //主機
const INDEX_URL = BASE_URL + '/api/v1/'; //index api
const SHOW_URL = INDEX_URL + '/users/'; //show api
const FRIENDS_AMOUNT = 10;

const dataPanel = document.querySelector('.data-panel'); //為了偵測滑鼠動作而設立
const userList = document.querySelector('#user-list'); //用來放人物頭像及名字
const userModalBody = document.querySelector('.modal-body'); //針對 modal 跳出來後渲染資料用
const userModal = document.querySelector('#user-modal'); //為了偵測滑鼠在 modal 的動作而設立
const searchForm = document.querySelector('#search-form'); //針對 search 表單設立
const searchInput = document.querySelector('#search-input');
const pagination = document.querySelector('.pagination');

const friends = []; //用來放 axios 抓到的人物資料
let inputKeyword = [];

axios
	.get(SHOW_URL)
	.then((response) => {
		friends.push(...response.data.results);
		renderPage(friends.length);
		displayUser(friendByPage(1));
	})
	.catch((error) => console.log(error));
//使用 axios 抓 api 裡面的資料，並用...的方式讓它一個一個push到friends裡面

function displayUser(data) {
	let rawHTML = '';
	data.forEach((item) => {
		rawHTML += `<div class ="user-info col-sm-2">
          <button class="info-link" data-bs-toggle ="modal" data-bs-target ="#user-modal">
          <img class = "user-img" id = "${item.id}"  src="${item.avatar}" >
          </button>
          <h5 id ="user-name">${item.name}</h5>
          </div>`;
	});
	userList.innerHTML = rawHTML;
}
// 上方是渲染人物資料至user-list中的函式

dataPanel.addEventListener('click', function() {
	let userUrl = SHOW_URL;
	const clicker = event.target;
	const detectId = clicker.id;
	if (clicker.tagName === 'IMG') {
		axios.get((userUrl += `${detectId}`)).then((response) => {
			const userModalBodyInfo = response.data;
			userModalBody.innerHTML = `
        <div id ="modal-user-info">
          <h1 class = "user-infos">${userModalBodyInfo.name} ${userModalBodyInfo.surname}</h1>
          <img src ="${userModalBodyInfo.avatar}"></img>
          <h5 class = "user-overview">Gender：${userModalBodyInfo.gender}</h5>
          <h5 class = "user-overview">Age：${userModalBodyInfo.age}</h5>
          <h5 class = "user-overview">Birthday：${userModalBodyInfo.birthday}</h5>
          <h5 class = "user-overview">E-mail：${userModalBodyInfo.email}</h5>
          <h5 class = "user-overview">Region：${userModalBodyInfo.region}</h5>   
        </div>

      <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="request" data-id ="${userModalBodyInfo.id}">Friend Request</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="close">Close</button>
      </div>
`;
		});
	}
});
// 上方則是 modal 跳出來時顯示在式窗內的資訊。code 邏輯：將 BASE_URL 另外裝在一個可變動的變數中，而 clicker 則設立成抓取事件目標，由於是根據圖片資訊來判斷要撈出哪筆資料，所以設立一個變數detectID用來抓 event.target 裡面的 id！接著設立 if 條件，若 event.target 的 tagName為 img，則根據上面抓到的 id 來使用 axios 向 api 去索取相對應的資訊，並將 user 資料渲染至 modal 裡面！

userModal.addEventListener('click', function() {
	let clicker = event.target;
	if (clicker.id === 'close' || clicker.id === 'closs-sign') {
		userModalBody.innerHTML = '';
	} else if (clicker.id === 'request') {
		requestFriends(Number(event.target.dataset.id));
	}
});
// 這邊的目的是我發現當我先點擊一個頭像開啟 modal ，關閉後再開啟其他的頭像時，modal 裡面的資訊會有一瞬間是前一個頭像的個人資料！所以我就另外安置事件監聽在 modal 上，只要判斷點擊的物件 id 是close，就直接清空 modal 的 innerHTML！

searchForm.addEventListener('submit', function searchFriendsForm() {
	event.preventDefault();
	const searchWord = searchInput.value.trim().toLowerCase();
  
  inputKeyword = friends.filter((friend) => friend.name.trim().toLowerCase().includes(searchWord));

	if (!searchWord.length) {
		return alert('請勿空白');
	}
  else if (inputKeyword.length === 0) {
    return alert('找不到'+ searchWord)
  }
  renderPage(inputKeyword.length)
	displayUser(friendByPage(1));
}); //搜尋欄功能函式

function requestFriends(id) {
	const list = JSON.parse(localStorage.getItem('friendsList')) || [];
	const friend = friends.find((friend) => friend.id === id);

	if (list.some((friend) => friend.id === id)) {
		return alert('你已是他的好友了！');
	}
	list.push(friend);
	localStorage.setItem('friendsList', JSON.stringify(list));
}

pagination.addEventListener('click', function paginator(event) {
	if (event.target.tagName !== 'A') return;
	const page = Number(event.target.dataset.page);
	displayUser(friendByPage(page));
}); //分頁器事件監聽，條件為點選 <a> 標籤

function renderPage(amount) {
	const numberOfPage = Math.ceil(amount / FRIENDS_AMOUNT);
	let rawHTML = '';

	for (page = 1; page <= numberOfPage; page++) {
		rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page ="${page}">${page}</a></li>`;
	}
	pagination.innerHTML = rawHTML;
} //渲染分頁

function friendByPage(page) {
	const startIndex = (page - 1) * FRIENDS_AMOUNT;
  const data = inputKeyword.length ? inputKeyword : friends
	return data.slice(startIndex, startIndex + FRIENDS_AMOUNT);
} //將資料分割成我要的數量的函式
