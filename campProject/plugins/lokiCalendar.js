dayjs.locale('zh-tw');
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isBetween);

// 宣告全域變數區
let
  apiPath = './db.json',
  booked = [],
  nationalHoliday = [],
  pallet = {},
  myCalender = null,
  tableData = { //初始的表格資料
    totalPrice: 0, // 總價
    normalCount: 0, // 平日入住數
    holidayCount: 0, // 平日入住數
    pallet: { //營位資料 => 標題名稱、可賣數量、預約日金、小計、訂購數
      aArea: { title: '河畔 × A 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 },
      bArea: { title: '山間 × B 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 },
      cArea: { title: '平原 × C 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 },
      dArea: { title: '車屋 × D 區', sellCount: 0, sellInfo: '<div></div>', sumPrice: 0, orderCount: 0 }
    }
  };


// 初始化作業
const init = () => {
  fetch('./db.json', { method: 'GET' })
    .then(res => res.json())
    .then(json => {
      // booked = json.booked;
      // pallet = json.pallet;
      // nationalHoliday = json.nationalHoliday;
      ({ booked, pallet, nationalHoliday } = json);
      //runCalendarService().print();

      myCalender = runCalendarService();
      myCalender.print();

      //規劃DOM事件
      document.querySelector('a[href="#prevCtrl"]').onclick = (e) => {
        e.preventDefault();
        myCalender.sub();
      };

      document.querySelector('a[href="#nextCtrl"]').addEventListener('click', (e) => {
        e.preventDefault();
        myCalender.add();
      });

      //計算4個房型的總價
      document.querySelectorAll('select').forEach(nodeSelect => {
        nodeSelect.onchange = (e) => {
          tableData.totalPrice = 0;
          document.querySelectorAll('select').forEach(item => {   //4組相加的總價
            tableData.totalPrice += parseInt(item.value) * tableData.pallet[item.name].sumPrice;

            //更新tableData的四組orderCount，方便獲取該有的情況
            tableData.pallet[item.name].orderCount = parseInt(item.value);
          });

          //更新總價
          document.querySelector('#selectPallet h3').textContent = `
          $${tableData.totalPrice} / ${tableData.normalCount}晚平日，${tableData.holidayCount}晚假日`;
        }
      });

      //製作左側彈窗
      const orderOffcanvas = new bootstrap.Offcanvas('.offcanvas'); //左側彈窗bootstrap建構函式
      document.querySelector('#selectPallet button').onclick = (e) => {
        let liStr = '';

        for (const key in tableData.pallet) {
          if (tableData.pallet[key].orderCount === 0) continue;

          liStr += `
          <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
              <div class="fw-bold"> ${tableData.pallet[key].title} </div>
              <div>
                ${tableData.pallet[key].sellInfo}
              </div>
            </div>
            <span class="badge bg-warning rounded-pill">x <span class="fs-6">${tableData.pallet[key].orderCount}</span>
          </li>`;
        }
        document.querySelector('#orderForm ol').innerHTML = liStr;
        document.querySelector('#orderForm .card-header.h5').innerHTML = document.querySelector('#selectPallet h3').textContent;
        orderOffcanvas.show();
      }

      //JSON 跟 Object不一樣  //** 面試必問 **//
      //回傳給後端存數值
      document.forms.orderForm.onsubmit = (e) => {
        e.preventDefault();
        const sendData = new FormData(e.target);

        const selectData = [...document.querySelectorAll('li.selectHead, li.selectConnect')].map(i => i.dataset.date);
        sendData.append('selectData', JSON.stringify(selectData));

        const sellout = {};
        Object.keys(tableData.pallet).forEach(key => {
          sellout[key] = tableData.pallet[key].orderCount
        })
        sendData.append('selectData', JSON.stringify(sellout));

        // for (const [key, value] of sendData) {
        //   console.log(key, value);
        // }


        //驗證輸入的正確性
        if (!e.target.checkValidity()) e.target.classList.add('was-validated');
        else {
          fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: sendData,
            //body: JSON.stringify({ userName: 1, password: 2 }),
            // headers: { 'Content-Type': 'multipart/form-data' }
          }).then(response => response.json())
            .then(res => {
              if (res.id) {
                alert('感謝預約，您的訂單為: ' + res.id);
                document.location.reload();   //畫面重載
              }
            });
        }
      }

      myCalender.tableRefresh();
    });
}

const runCalendarService = () => {
  // 宣告區，注意這裡變成只有service可以讀到的變數或fn，所以console.log不會印出
  let theDay = dayjs();
  let
    calLeft = {
      title: 'Left Calendar',
      listBox: '',
      thisDate: theDay,
    },
    calRight = {
      title: 'Right Calendar',
      listBox: '',
      thisDate: theDay.add(1, 'month'),
    };

  const today = dayjs();
  const userChooseDays = [null, null];
  const initTableDataStr = JSON.stringify(tableData);
  const
    changeMonth = (num) => {
      theDay = theDay.add(num, 'month');
      calLeft = {
        title: '',
        listBox: '',
        thisDate: theDay,
      };
      calRight = {
        title: '',
        listBox: '',
        thisDate: theDay.add(1, 'month'),
      };
    },

    chooseList = (node) => {
      //console.log(item.dataset.date);
      if (!userChooseDays[0] && !userChooseDays[1]) {
        node.classList.add('selectHead');
        userChooseDays[0] = node;
      } else if (userChooseDays[0] && !userChooseDays[1]) {
        node.classList.add('selectFoot');
        userChooseDays[1] = node;

        const sec2fst = dayjs(userChooseDays[1].dataset.date).isSameOrBefore(userChooseDays[0].dataset.date);
        if (sec2fst) {
          userChooseDays[0].classList.replace('selectHead', 'selectFoot');
          userChooseDays[1].classList.replace('selectFoot', 'selectHead');

          [userChooseDays[0], userChooseDays[1]] = [userChooseDays[1], userChooseDays[0]];
          //or
          //userChooseDays[1].classList.remove('selectFoot');
          //userChooseDays[1].classList.add('selectHead');
          //userChooseDays[0].classList.remove('selectHead');
          //userChooseDays[0].classList.add('selectFoot');
        }

        document.querySelectorAll('li.selectDay').forEach(item => {
          const isBetween = dayjs(item.dataset.date).isBetween(
            userChooseDays[0].dataset.date,
            userChooseDays[1].dataset.date
          );
          if (isBetween) item.classList.add('selectConnect');
        });

        tableMaker();
      } else {
        userChooseDays[0].classList.remove('selectHead');
        node.classList.add('selectHead');
        userChooseDays[0] = node;
        userChooseDays[1].classList.remove('selectFoot');
        userChooseDays[1] = null;

        document.querySelectorAll('li.selectConnect').forEach(item => {
          item.classList.remove('selectConnect')
        });
      }

    },

    listMaker = (obj) => { // 調整萬年曆物件，調整完畢後，返回修改後的物件
      // const firstDay = obj.thisDate.date(1).day();
      const firstDay = obj.thisDate.startOf('month').day(); // 該月第一天禮拜幾
      const totalDay = obj.thisDate.daysInMonth(); // 該月有幾天

      // 1 = mon, 2 = tue, 3 = wed, 4 = thu, 5 = fri, 6 = sat, 0(7) = sun
      for (let i = 1; i < (firstDay || 7); i++) { // 控制產生多少空白日
        obj.listBox += `<li class="JsCal"></li>`;
      }

      for (let i = 1; i <= totalDay; i++) { // 控制產生多少日期
        let classStr = 'JsCal';

        //過期判定
        const tempDay = obj.thisDate.date(i);
        const tempDayStr = tempDay.format('YYYY-MM-DD');

        if (tempDay.isSameOrBefore(today)) {
          classStr += ' delDay';
        } else { //沒過期的話
          //假日判定，包含國定假日
          const isNationalHoliday = nationalHoliday.includes(tempDay.format('YYYY-MM-DD'));
          if (((firstDay + i) % 7 < 2) || isNationalHoliday)
            classStr += ' holiday';

          //滿房的話
          const checkBookObject = booked.find((bookObj) => {
            return bookObj.date === tempDay.format('YYYY-MM-DD');
          });
          if (checkBookObject &&
            (pallet.count === Object.values(checkBookObject.sellout).reduce((prv, cur) => prv + cur, 0))
          )
            classStr += ' fullDay';

          classStr += ' selectDay';
        }

        obj.listBox += `<li class="${classStr}" data-date="${tempDayStr}">${i}</li>`;
      }

      // method 1
      // obj.title = `${obj.thisDate.year()}年 ${obj.thisDate.month() + 1}月`;

      // method 2
      // const monthToString = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // obj.title = `${monthToString[obj.thisDate.month()]} ${obj.thisDate.year()}`;

      // method 3
      const twMonth = window.dayjs_locale_zh_tw.months;
      obj.title = `${twMonth[obj.thisDate.month()]} ${obj.thisDate.year()}`;

      return obj;
    },

    listPrint = () => { // 準備輸出到DOM
      // console.log(listMaker(calLeft).listBox);

      const newCalLeft = listMaker(calLeft);
      listMaker(calRight);

      document.querySelector('.leftDayList').innerHTML = newCalLeft.listBox;
      document.querySelector('.rightDayList').innerHTML = calRight.listBox;

      document.querySelector('.leftBar>h4').innerHTML = newCalLeft.title;
      document.querySelector('.rightBar>h4').innerHTML = calRight.title;

      //畫面更新後，考慮這些selectDay的日子
      document.querySelectorAll('.selectDay').forEach((item) => {
        item.onclick = () => myCalender.choose(item);
      })
    },

    tableMaker = () => {
      tableData = JSON.parse(initTableDataStr);  //乾淨的tableData

      for (const key in tableData.pallet) {
        tableData.pallet[key].sellCount = pallet[key].total;
      }

      document.querySelectorAll('li.selectHead, li.selectConnect').forEach(item => {
        for (const key in tableData.pallet) {
          const hasOrder = booked.find(bookItem => bookItem.date === item.dataset.date);

          //如果後端有找到當日訂單，更新房況剩餘數
          if (hasOrder) {
            tableData.pallet[key].sellCount = Math.min(tableData.pallet[key].sellCount, pallet[key].total - hasOrder.sellout[key]);
          }

          //如果房況有剩，提供該key的販售資訊
          if (tableData.pallet[key].sellCount) {
            //const dayPrice = item.classList.contains('holiday') ? pallet[key].holidayPrice : pallet[key].normalPrice;
            const dayPrice = pallet[key][item.classList.contains('holiday') ? 'holidayPrice' : 'normalPrice'];

            //console.log(item.dataset.date, dayPrice);
            tableData.pallet[key].sellInfo += `<div>${item.dataset.date} (${dayPrice})</div>`;
            tableData.pallet[key].sumPrice += dayPrice;
          } else {
            tableData.pallet[key].sellInfo = `<div>已售完</div>`;
            tableData.pallet[key].sumPrice = 0;
          }
        }

        //item.classList.contains('holiday') ? tableData.holidayCount++ : tableData.normalCount++;
        tableData[item.classList.contains('holiday') ? 'holidayCount' : 'normalCount']++;
      });

      tablePrint();
    },

    tablePrint = () => {
      //console.log('tableData做成HTML');
      document.querySelectorAll('form select').forEach(nodeSelect => {
        let optStr = '';
        const countOption = tableData.pallet[nodeSelect.name].sellCount;

        for (let i = 0; i <= countOption; i++) {
          optStr += `<option value"${i}">${i}</option>`;
        }
        nodeSelect.innerHTML = optStr;
        nodeSelect.disabled = countOption === 0;

        const tdSellInfo = nodeSelect.parentElement.previousElementSibling;
        tdSellInfo.innerHTML = tableData.pallet[nodeSelect.name].sellInfo;

        const tdRemain = tdSellInfo.previousElementSibling.querySelector('span');
        tdRemain.textContent = countOption;

        document.querySelector('#selectPallet h3').textContent = `
        $${tableData.totalPrice} / ${tableData.normalCount}晚平日，${tableData.holidayCount}晚假日`;
      });
    }

  //listPrint();    //** 閉包觀念 面試必問**//
  return {
    print: () => listPrint(),
    add: () => {
      //console.log('right')
      changeMonth(1);
      listPrint();
    },
    sub: () => {
      //console.log('left')
      changeMonth(-1);
      listPrint();
    },
    choose: item => {
      if (item.classList.contains('selectHead') && !userChooseDays[1]) return;
      chooseList(item);
    },
    tableRefresh: () => tablePrint()
  };
}


init();
// console.log(today);
