getHTML: function () {
	var that = this;
	var str = '<div class="js-numbers numbers" data-mykey="' + that.myKey + '" data-myset="' + that.mySet + '" style="float: left;">';
	str += '<table>';
	str += '<tbody><tr>';
	// 一行は5列
	var len = Math.ceil(window.RL.Conf.totalNums / 5) * 5;
	_(len).times(function (i) {
		var label = i + 1;
		var index = i % 5;
		if (index === 0 && i > 0) {
			str += '</tr><tr>';
		}
		if (i < window.RL.Conf.totalNums) {
			str += '<td class="js-n" data-key="' + that.myKey + '-' + label + '">' + label + '</td>';
		} else {
			str += '<td class="is-empty"></td>';
		}
	});
	str += '</tr></tbody></table>';
	// 追加ここから
	str += '<div class="js-remain" style="position: absolute; bottom: 0;right: 0; padding: 10px;border: 1px solid #000; background:#fff;">aaaaaaaaa</div>';
	// 追加ここまで
	str += '<div class="js-quickpic number-main-quickpic">'
	str += '<div class="js-quickpic number-main-quickpic">';
	str += '<h2 class="number-main-quickpic-title">クイックピック選択中</h2>';
	str += '<p class="number-main-quickpic-text">数字は購入してからのお楽しみ</p>';
	str += '</div>';
	str += '<div class="js-leave number-main-leave">';
	str += '<div class="inner">';
	str += '<div class="inner2"><p class="icon"></p></div>';
	str += '<div class="inner2">';
	str += '<h2 class="number-main-leave-title">残りをおまかせ選択中</h2>';
	str += '<p class="number-main-leave-text">数字は購入してからのお楽しみ</p>';
	str += '</div></div>';
	str += '</div></div>';
	return str;
}



// クイックピック処理
that.$render.find('.js-numbers').each(function() {
    var setN = $(this).closest('.js-numbers').data('myset');
    var myKey = $(this).closest('.js-numbers').data('mykey');

    if (that.isAuto({
	    set: setN,
	    group: myKey
	})) {
	// autoだったら
	$(this).find('.js-quickpic').addClass('is-on');
	// 追加ここから
	$(this).find('.js-remain').hide();
	// 追加ここまで
    } else {
	$(this).find('.js-quickpic').removeClass('is-on');
	// 追加ここから
	$(this).find('.js-remain').show();
	// 追加ここまで
    }
});


// 登録
register: function(data, $target) {
    var that = this;
    var myNumbers = that.panels()[that.currentSet()].input[data.group].numbers;
// 追加ここから
    var currentSet = that.panels()[that.currentSet()].input[data.group].name.toLowerCase();
// 追加ここまで
    // numberが空のvalueのもの
    var isRegistered = that._isRegistered(myNumbers, data.number);
    var emptyIndex = that._getEmptyNumberIndex(myNumbers);

    if (!isRegistered && !_.isNull(emptyIndex)) {
        // vmをアップデート
        myNumbers.splice(emptyIndex, 1, {
            value: data.number,
            random: false
        });
        // 登録処理
        if ($target) {
            $target.addClass('is-selected');
        }
    } else if (isRegistered) {
        // 登録削除
        that._removeNumber(myNumbers, data.number);
        $target.removeClass('is-selected');
        $target.removeClass('is-random');
    }
// 追加ここから
    var count = that.$numbersWrap.find('[data-mykey=' + currentSet + ']').find('.js-n.is-selected').length;
    that.$numbersWrap.find('[data-mykey=' + currentSet + ']').find('.js-remain').text(7 - count);
// 追加ここまで
},
