// 登録
					register: function (data, $target) {
            var that = this;
            var myNumbers = that.panels()[that.currentSet()].input[data.group].numbers;
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
            var count = $('.js-n.is-selected').length;
            console.log( 7 - count );
					}
