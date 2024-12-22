
!function () {  //  使用 IIFE 避免污染全域變數
    const initLokiLightBox = () => {
        const lightBoxNode = document.querySelector('#lokiLightBox');
        const mainZoneNode = lightBoxNode.querySelector('.mainZone');
        const controlNode = lightBoxNode.querySelector('.control');

        //col 為每張照片主題
        document.querySelectorAll('#lokiPark .col').forEach((colNode) => {
            const newMinImgNode = colNode.querySelector('img').cloneNode();
            newMinImgNode.dataset.label = colNode.querySelector('h5').textContent;

            newMinImgNode.addEventListener('click', (e) => {
                //e.stopPropagation();    //阻止事件冒泡

                mainZoneNode.querySelector('img').src = newMinImgNode.src;
                mainZoneNode.querySelector('p').textContent = newMinImgNode.dataset.label;
            });

            controlNode.append(newMinImgNode);

            //規劃col事件 打開燈箱
            colNode.addEventListener('click', () => {

                //mainZoneNode.querySelector('img').src = colNode.querySelector('img').src;
                //mainZoneNode.querySelector('p').textContent = colNode.querySelector('h5').textContent;

                mainZoneNode.click();

                lightBoxNode.classList.add('active');
            });
        });


        //燈箱關閉事件
        // lightBoxNode.querySelector('.backdrop').addEventListener('click', () => {
        //     lightBoxNode.classList.remove('active');
        // });

        // lightBoxNode.querySelector('.backdrop').addEventListener('click', (e) => {
        //     e.target.parentNode.classList.remove('active');
        // });

        lightBoxNode.querySelector('.backdrop').addEventListener('click', function () {
            this.parentNode.classList.remove('active');
        });
    };


    initLokiLightBox();
}();
