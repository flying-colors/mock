$(function(){
	// 要素を取得
	var $selectBtn = $('.js-selectBtn');
	var $purchanseBtn = $('.js-btnPurchase');
	var $resetBtn = $('.js-btnReset');
	var $addedNum = $('.js-addedNum');
	var count = 0;
	var limitSelectNum = 7;

	// 選択した数字が1つ以上あれば「購入設定」ボタンを活性
	function activateBtn() {
		var countSelectNum = $('.is-select').length;
		if(countSelectNum !== 0){
			 $purchanseBtn.removeClass('is-disabled').prop("disabled", false);
		} else {
			 $purchanseBtn.addClass('is-disabled').prop("disabled", true);
		}
	}

	// 選択した数字を削除
	function removeSelectedNum(_self,selectedNum) {		
		var $addedNum = $("#"+ selectedNum);
		$($addedNum).remove();
	}
	
	// 選択した数字を解除
	function resetSelectNum() {
		$selectBtn.removeClass('is-select');
		$addedNum.text('').removeClass('is-added');
		count = 0;
	}

	// 選択した数字を管理
	function addedNum(selectNum) {
		$addedNum.eq(count).addClass('is-added').text(selectNum);
	}

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
		 
		activateBtn();
		addedNum(selectedNum);
		count++;
		return false;
	});
	
	// 選択解除
	$resetBtn.on('click', function(){
		activateBtn();
		resetSelectNum();
	});

	$('.js-tr').on('click', function(){
		$(this).toggleClass('is-select');
	});
	
	$('.js-span').on('click', function(){
		$(this).toggleClass('is-select');
	});

});
