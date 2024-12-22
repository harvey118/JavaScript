onload = () => {
  var grid = document.querySelector('#lokiPark article.row');
  var msnry = new Masonry(grid, { percentPosition: 'true' });
}


//cookie設定
//1.取得 cookie 的拆解陣列
const
  cookieArry = document.cookie.split('; '),
  nodeCookie = document.querySelector('#lokiCookie'),
  keywordCookie = 'cookieUsed=agree';

//檢查cookie是否有關鍵字
if (cookieArry.includes(keywordCookie)) {
  //已同意
  nodeCookie.remove();
} else {
  //尚未同意
  nodeCookie.style.display = 'block';

  nodeCookie.querySelector('button').onclick = () => {
    //設定COOKIE

    //方法一
    //document.cookie = keywordCookie;

    //方法二
    //now = new Date();
    //now.setTime(now.getTime() + (24 * 60 * 60 * 1000));
    //document.cookie = `${keywordCookie}; expires=${now.toUTCString()}`;

    //方法三
    document.cookie = `${keywordCookie}; max-age=${24 * 60 * 60 * 180}`;
    nodeCookie.remove();
  }
}