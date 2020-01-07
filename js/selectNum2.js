$(function () {
    // 要素を取得
    const $selectBtn = $('.js-selectBtn'),
    $purchanseBtn = $('.js-btnPurchase'),
	$resetBtn = $('.js-btnReset'),
	$addedNum = $('.js-addedNum');
	let count = 0,
    limitSelectNum = 7;
    
    const Takarakuji = Takarakuji || {
        methods:{
            // 選択した数字が1つ以上あれば「購入設定」ボタンを活性
            activateBtn: ()=>{
                var countSelectNum = $('.is-select').length;
                if(countSelectNum !== 0){
                    $purchanseBtn.removeClass('is-disabled').prop("disabled", false);
                } else {
                    $purchanseBtn.addClass('is-disabled').prop("disabled", true);
                }
            },

            // 選択した数字を解除
            resetSelectNum: ()=> {
                $selectBtn.removeClass('is-select');
                $addedNum.text('').removeClass('is-added');
                count = 0;
            },

            // 選択した数字を管理
            addedNum: (selectNum)=> {
                $addedNum.eq(count).addClass('is-added').text(selectNum);
            }
        },
        events: (e)=>{
            $resetBtn.onclick = Takarakuji.methods.activateBtn(e);
            $resetBtn.onclick = Takarakuji.methods.resetSelectNum(e);
            console.log('test');
            
        }
        
    };

    // Takarakuji.methods.events();

    // 数字ボタンで選択
	$selectBtn.on('click', function(){
		var _self = $(this);
		var countSelectNum = $('.is-select').length;
		var selectedNum = $(this).text();
		if (countSelectNum >= limitSelectNum){
			$(this).removeClass('is-select');
		} else {
			$(this).toggleClass('is-select');
		}
		 
		Takarakuji.methods.activateBtn();
		Takarakuji.methods.addedNum(selectedNum);
		count++;
		return false;
    });
    
    // 選択解除
	// $resetBtn.on('click', function(){
	// 	Takarakuji.methods.activateBtn();
	// 	Takarakuji.methods.resetSelectNum();
	// });

	$('.js-tr').on('click', function(){
		$(this).toggleClass('is-select');
	});
	
	$('.js-span').on('click', function(){
		$(this).toggleClass('is-select');
	});

});
