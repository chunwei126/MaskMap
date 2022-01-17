let callbackData;
let callbackDataLen;
let countyOption = document.getElementById("county");
let townOption = document.getElementById("town");
let storeOption = document.getElementById("store");
let list = document.querySelector(".list");
let warning = document.querySelector(".warning");
let wrap = document.querySelector(".wrap");

/////監聽/////
countyOption.addEventListener("change",addTownList,false);
townOption.addEventListener("change",addStoreList,false);
storeOption.addEventListener("change",getStoreinfo,false);

/////函式/////
///載入-start///
window.onload = function(){
	let now = document.querySelector(".now");
	let today = new Date();
	let year = today.getFullYear();
	let month = today.getMonth()+1;
	let date = today.getDate();
	let day =today.getDay();
	let todayStr = ""
	switch(true){
		case day == 1:
			todayStr = year+"年 "+month+"月 "+date+"日 星期一"
			break;
		case day == 2:
			todayStr = year+"年 "+month+"月 "+date+"日 星期二"
			break;
		case day == 3:
			todayStr = year+"年 "+month+"月 "+date+"日 星期三"
			break;
		case day == 4:
			todayStr = year+"年 "+month+"月 "+date+"日 星期四"
			break;
		case day == 5:
			todayStr = year+"年 "+month+"月 "+date+"日 星期五"
			break;
		case day == 6:
			todayStr = year+"年 "+month+"月 "+date+"日 星期六"
			break;
		default:
			todayStr = year+"年 "+month+"月 "+date+"日 星期日"
	}
	now.textContent = todayStr;

	let xhr = new XMLHttpRequest();
	xhr.open('get','https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json',true);
	xhr.send();
	xhr.onload = function(){
	callbackData = JSON.parse(xhr.responseText).features;
	callbackDataLen = callbackData.length;
	addCountyList();
	}
}
///載入-end///

///縣市選單-start///
function addCountyList(){
	/*將陣列裡的所有 "縣市" 過濾出重複的值*/
	//說明：宣告 countyName的值 為每筆資料的 county，並利用 for 、 if 和 indexOf 假設 countyList 裡面沒有該筆 countyName的值，而且 countyName的值非空值的話，就將它加入 countyList陣列（countyList為空陣列的關係，所以一定不會有值），最後將每筆放進去的 countyName 的值帶入 countyStr 當中。
	let countyList = [];
	let countyStr = "<option>--請選擇縣市--</option>";
	for (let i = 0; i < callbackDataLen; i++) {
		let countyName = callbackData[i].properties.county;
		if (countyList.indexOf(countyName) == -1 && countyName !== ''){
			countyList.push(countyName);
			countyStr += "<option value="+countyName+">"+countyName+"</option>"
		}
	}
	countyOption.innerHTML = countyStr;
	townOption.innerHTML = "<option>--請選擇行政區--</option>" //預設
	storeOption.innerHTML = "<option>--請選擇藥局--</option>" //預設
}
///縣市選單-end///

///行政區選單-start///
let countyValue;
function addTownList(e){
	/*判斷點擊哪個縣市並將符合該縣市的所有 "行政區" 加入陣列*/
	//說明：如果點擊到的 "縣市option" 的 value 有符合 county 名稱，就將該筆資料的行政區加入 allTown（此時的allTown尚未過濾，所以有重複值）
	countyValue = e.target.value;
	let allTown = [];
	for(let i = 0; i < callbackDataLen; i++){
		if(countyValue == callbackData[i].properties.county){
			allTown.push(callbackData[i].properties.town);
		}
	}

	/*將陣列裡的所有 "行政區" 過濾出重複的值*/
	let townList = [];
	let townStr = "<option>--請選擇行政區--</option>"
	for(let i = 0; i < allTown.length; i++){
		let townName = allTown[i]
		if (townList.indexOf(townName) == -1 && townName !== ''){ // -1 == 沒有這筆值
			townList.push(townName);
			townStr += "<option value="+townName+">"+townName+"</option>"
		}
	}
	townOption.innerHTML = townStr;
}
///行政區選單-end///

///藥局選單-start///
let townValue;
function addStoreList(e){
	/*判斷點擊哪個行政區並將符合該行政區的所有 "藥局" 加入陣列*/
	//if設定說明：由於不同縣市的行政區名稱有重複的關係，為了避免撈到 「非指定縣市的行政區的藥局」，所以 if 另外增加 countyValue == callbackData[i].properties.county 條件。
	townValue = e.target.value;
	let allStore = [];
	for(let i = 0; i < callbackDataLen; i++){
		if(townValue == callbackData[i].properties.town && countyValue == callbackData[i].properties.county){
			allStore.push(callbackData[i].properties.name);
		}
	}

	/*將陣列裡的所有 "藥局" 過濾出重複的值*/
	let storeList = [];
	let storeStr = "<option>--請選擇藥局--</option>"
	for(let i =0; i < allStore.length; i++){
		let storeName = allStore[i];
		if (storeList.indexOf(storeName) == -1 && storeName !== ''){ // -1 == 沒有這筆值
			storeList.push(storeName);
			storeStr += "<option value="+storeName+">"+storeName+"</option>"
		}
	}
	storeOption.innerHTML = storeStr;
}
///藥局選單-end///

///取得藥局資訊-start///
let latitude;//緯度
let longitude;//經度
function getStoreinfo(e){
	let storeValue = e.target.value;
	let listLi = "";
	for(let i = 0; i < callbackDataLen; i++){
		if(storeValue == callbackData[i].properties.name && townValue == callbackData[i].properties.town && countyValue == callbackData[i].properties.county){
			listLi += "<li><h3>"+callbackData[i].properties.name+"</h3><p>"+callbackData[i].properties.address+"</p><p>"+callbackData[i].properties.phone+"</p><p>"+'最後更新時間：'+callbackData[i].properties.updated+"</p><div class='map' id='map'></div><p class='note'><span class='green'><i class='fas fa-map-marker-alt'></i></span>：庫存充足<span class='gold'><i class='fas fa-map-marker-alt'></i></span>：庫存緊缺<span class='red'><i class='fas fa-map-marker-alt'></i></span>：毫無庫存</p></li>"

			latitude = callbackData[i].geometry.coordinates[1];
			longitude = callbackData[i].geometry.coordinates[0];
		}
		list.innerHTML = listLi;
	}
	getmap();
}
///取得藥局資訊-end///

///取得地圖資訊-start///
function getmap(){
	let map = L.map('map', {
		center: [latitude,longitude],//初始定位
		zoom: 18
	});
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	let greenIcon = new L.Icon({
		iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});
	let redIcon = new L.Icon({
		iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
	shadowSize: [41, 41]
	});
	let goldIcon = new L.Icon({
		iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
		shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
		shadowSize: [41, 41]
	});

	//判斷口罩庫存量並標示藥局座標位置
	for(let i = 0; i < callbackDataLen; i++){
		let mask;
		switch(true){
			case callbackData[i].properties.mask_adult == 0:
				mask = redIcon;
				break;
			case callbackData[i].properties.mask_adult <= 100:
				mask = goldIcon;
				break;
			default:
				mask = greenIcon;
		}
		if(callbackData[i].geometry.coordinates[1] == latitude && callbackData[i].geometry.coordinates[0] == longitude){
			L.marker([latitude,longitude], {icon: mask}).addTo(map)
			.bindPopup('<h4>'+callbackData[i].properties.name+'</h4>'+'<p class="mask_adult">成人口罩數量：'+callbackData[i].properties.mask_adult+' 片</p>'+'<p class="mask_child">孩童口罩數量：'+callbackData[i].properties.mask_child+' 片</p>')
			.openPopup();
		}
	}
	warning.style.display = "block";
}