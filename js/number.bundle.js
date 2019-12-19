(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * ■■■■■■■■ AddPurchaseAmount ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

module.exports = (function() {

  function AddPurchaseAmount(model){
    var that = this;
    that.viewModel = model;
    that.displayViewModel = ko.observableArray([
      {value: 0, text: '利用しない'},
      {value: 1, text: '利用する（1口）'},
      {value: 5, text: '利用する（5口）'},
      {value: 10, text: '利用する（10口）'}
    ]);
  }

  return AddPurchaseAmount;

}());
},{}],2:[function(require,module,exports){
/**
 * ■■■■■■■■ VoteContinuationCount Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

module.exports = (function() {

  function VoteContinuationCount(model){
    var that = this;

    that.viewModel = model;
    that.displayViewModel = ko.observableArray([]);

    _(window.RL.Conf.vote_continuation_count).each(function(value){
      that.displayViewModel.push({
        text: value + '回',
        value: value
      });
    });

  }

  return VoteContinuationCount;

}());

},{}],3:[function(require,module,exports){
var Config = (function() {

  var instance;

  function Config() {
    this.ENV      = 'prod';
    this.isAuto   = false;
    this.category = 'takarakuji';
    this.lotoType = 6;
  }

  // Getter / Setter
  Config.prototype.env = function(env) {
    var that = this;
    if (env) {
      that.ENV = env;
    }
    else {
      return that.ENV;
    }
  };

  Config.prototype.setIsAuto = function(aIsAuto) {
    var that = this;
    that.isAuto = aIsAuto;
  };

  Config.prototype.isAuto = function() {
    return this.isAuto;
  };

  Config.prototype.setCategory = function(aCategory) {
    this.category = aCategory;
  };

  Config.prototype.category = function() {
    return this.category;
  };

  Config.prototype.setLotoType = function(aLotoType) {
    this.lotoType = aLotoType * 1;
  };

  Config.prototype.lotoType = function() {
    return this.lotoType;
  };

  return {
    getInstance: function() {
      if(!instance) {
        instance = new Config();
      }
      return instance;
    }
  };

}());

module.exports = Config.getInstance();

},{}],4:[function(require,module,exports){
/**
 * ■■■■■■■■ NumberViewModel ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

var util   = require('../utils/util');
var config = require('../config/config');

var NumberViewModel = (function() {

  var instance;

  function NumberViewModel() {
    var that = this;
    // 現在のアクティブセットナンバー
    that.activeSet = ko.observable();
    // 現在のアクティブTicket(A-E)
    that.activeTicket = ko.observable('a');
    // すべてのViewModel
    that.allViewModel = null;
    that.labels = ['a', 'b', 'c', 'd', 'e'];

    // 初期表示用のフラグ
    that.isReady = ko.observable(false);

    // 追加用のパネルテンプレ
    that.panelTpl = null;

    that._createVM = function(obj) {
      var ret = null;
      var mapping = {
        panels: {
          create: function(obj) {
            _(obj.data.input).each(function(o){
              o.continuecount = ko.observable(o.continuecount);
              // o.continuecount.extend({rateLimit: 1000});
              o.amount = ko.observable(o.amount);
              // o.amount.extend({rateLimit: 1000});
              o.auto = ko.observable(o.auto);
              // o.auto.extend({rateLimit: 1000});
              o.numbers = ko.observableArray(o.numbers);
              // if (config.category.indexOf('sp') >= 0) {
              //   o.numbers.extend({rateLimit: 500});
              // }
            });
            return obj.data;
          }
        }
      };
      ret = ko.mapping.fromJS(obj, mapping);
      return ret;
    };

    that.createNewPanelVM = function() {
      var obj = $.extend(true, {}, that.panelTpl);
      _(obj.input).each(function(o){
        o.continuecount = ko.observable(o.continuecount);
        // o.continuecount.extend({rateLimit: 1000});
        o.amount = ko.observable(o.amount);
        // o.amount.extend({rateLimit: 1000});
        o.auto = ko.observable(o.auto);
        // o.auto.extend({rateLimit: 1000});
        o.numbers = ko.observableArray(o.numbers);
        // if (config.category.indexOf('sp') >= 0) {
        //   o.numbers.extend({rateLimit: 500});
        // }
      });
      return obj;
    };

  }

  NumberViewModel.prototype = {

    setup: function() {
      var that = this;
      // サーバーからの値を監視可能なViewModelに変更する
      var obj = $.extend(true, {}, window.RL.Model);
      that.allViewModel = that._createVM( obj );

      that.panelTpl = $.extend( true, {}, window.RL.Model.panels[0] );
      _(that.panelTpl.input).each(function(value, key){
        value.amount = 1;
        value.auto = false;
        value.continuecount = 1;
        value.errors = [];
        _(value.numbers).each(function(n){
          n.value = '';
          n.random = false;
        });
      });
    },

    get: function() {
      var that = this;
      return that.allViewModel;
    },

    getPanelLen: function() {
      var that = this;
      return that.get().panels().length;
    },

    // 欲しいパネルを返す
    getMyPanel: function(data) {
      // group: a-e, set:0
      var that = this;
      return that.get().panels()[data.set].input[data.group];
    },

    nextTicket: function() {
      var that = this;
      var index = _.indexOf(that.labels, that.activeTicket());
      var nextTicketLabel = function() {
        var nextIndex = (index + 1);
        if (nextIndex < that.labels.length) {
          return that.labels[nextIndex];
        }
        else {
          return false;
        }
      };
      if (nextTicketLabel()) {
        that.activeTicket( nextTicketLabel() );
      }
      else {
        var activeSet = that.activeSet();
        var panelLen = that.allViewModel.panels().length;
        if ((panelLen - 1) === activeSet) {
          // セット追加のシグナル発信
          Signal.notify('add_set');
        }
        else {
          Signal.notify('move_next');
        }
      }
    },

    prevTicket: function() {
      var that = this;
      var index = _.indexOf(that.labels, that.activeTicket());
      var prevTicketLabel = function() {
        var prevIndex = (index - 1);
        if (prevIndex >= 0) {
          return that.labels[prevIndex];
        }
        else {
          return false;
        }
      };
      if(prevTicketLabel()) {
        that.activeTicket( prevTicketLabel() );
      }
      else {
        // セットを戻すシグナル発信
        // 引数は前へ戻るボタンをクリックしたフラグ
        Signal.notify('set_back', true);
      }

    },

    addPanel: function() {
      var that = this;
      // var obj = that._createVM( $.extend(true, {}, that.panelTpl) );
      var obj = that.createNewPanelVM();
      that.allViewModel.panels.push(obj);
    },

    // 送信データ作成
    createSubmitData: function() {
      // input:hiddenを作成して返す
      var generateInputHidden = util.createInputHidden;

      var that = this;
      var vm = that.get();
      // 銀行対策
      var $submitData = $('#submitData, .submitData');
      var $allFragment = $(document.createDocumentFragment()); // 全部のラッパー

      $allFragment.append( generateInputHidden('loto_type', vm.loto_type()) ); // loto_type
      $allFragment.append( generateInputHidden('unit_price', vm.unit_price()) ); // unit_price

      if (!_.isUndefined(vm.vote_continuation_count)) {
        $allFragment.append( generateInputHidden('vote_continuation_count', vm.vote_continuation_count()) ); // vote_continuation_count
      }
      $allFragment.append( generateInputHidden('vote_continuation_flag',vm.vote_continuation_flag() * 1) ); // vote_continuation_flag
      $allFragment.append( generateInputHidden('professional', vm.professional()) ); // professional

      // add_purchase_amount
      if (vm.add_purchase_amount) {
        $allFragment.append( generateInputHidden('add_purchase_amount', vm.add_purchase_amount()) );
      }

      // auto_vote
      $allFragment.append( generateInputHidden('auto_vote', vm.auto_vote()) );

      // panels
      var $panelFragment = $(document.createDocumentFragment());
      var panelArr = [];

      // console.log(vm.panels().null);

      _(vm.panels()).each(function(panel) {
        // A?Eを回す
        _(panel.input).each(function(ticket) {
          var tmpArr = [];
          var numbersArr = ticket.numbers();
          for (var i = 0; i < 7; i++) {
            var number = numbersArr[i];
            if(_.isUndefined(number)) {
              tmpArr.push('');
            }
            else {
              if(number.random) {
                tmpArr.push('R' + number.value);
              }
              else {
                tmpArr.push(number.value);
              }
            }
          }
          tmpArr.push( (ticket.auto() * 1) + "" );
          // 購入口数を追加
          tmpArr.push( ticket.amount() );
          // 継続回数を追加
          if (!vm.auto_vote()) {
            tmpArr.push( ticket.continuecount() );
          }
          panelArr.push(tmpArr);
        });
      });

      _(panelArr).each(function(arr, i) {
        var $panel = generateInputHidden('panel[' + i + ']', arr.join(','), 'js-input-amount');
        $panelFragment.append($panel);
      });

      // 合計金額
      if ( !_.isUndefined(vm.total_price) ) {
        var $totalPrice = generateInputHidden('total_price', vm.total_price());
        $totalPrice.val( util.totalPrice(vm) );
        $allFragment.append( $totalPrice );
      }

      $allFragment.append($panelFragment);

      $submitData.empty().append($allFragment);
    },

    submit: function() {
      this.createSubmitData();
      setTimeout(function(){
        $('#my-form').submit();
      }, 100);
    }

  };

  return {
    getInstance: function(){
      if(!instance) {
        instance = new NumberViewModel();
      }
      return instance;
    }
  };

}());

module.exports = NumberViewModel.getInstance();

},{"../config/config":3,"../utils/util":16}],5:[function(require,module,exports){
/**
 * ■■■■■■■■ Amount Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

var AllViewModel = require('../model/number.model');

module.exports = (function() {

  function Amount(){
    var that = this;
    that.viewModel = null;
    that.displayViewModel = ko.observableArray([]);
    if (window.RL.Conf.amount === 0) window.RL.Conf.amount = 10;
    for (var i = 1; i <= window.RL.Conf.amount; i++) {
      that.displayViewModel.push({
        text : i + '口',
        value: i
      });
    }
    Signal.subscribe('on_change_label', function(data){
      that.setViewModel(data);
    });
    that.chosenValue = ko.observableArray([3]);
  }

  Amount.prototype = {

    setViewModel: function(vm) {
      var that = this;
      var amount = AllViewModel.getMyPanel(vm).amount;
      that.viewModel = amount;
      $('.js-amount')
        .find('option')
        .removeAttr('selected')
        .end()
        .find('option[value="' + amount() +'"]')
        .prop('selected', true);
    }

  };

  return Amount;

}());

},{"../model/number.model":4}],6:[function(require,module,exports){
/**
* ■■■■■■■■ App Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

var AllViewModel       = require('../model/number.model');
var MarksheetViewModel = require('./Marksheet');
var NumbersViewModel   = require('./NumbersView');
var LocalStrage        = require('../utils/LocalStrage');
var util               = require('../utils/util');
var device             = require('../utils/device');

module.exports = (function(){

  function App(aIsExtend) {
    var that = this;
    // 全体のViewModel
    var allViewModel = that.allViewModel = that.appViewModel = AllViewModel.get();
    var isExtend = aIsExtend || false;

    that.$marksheet = $('#js-marksheet');
    that.$edit = $('#js-edit');

    // 出力する数字数
    that.totalNums = window.RL.Conf.totalNums;
    that.lotoType = allViewModel.loto_type();

    if ( allViewModel.loto_type() === 6 ) {
      $('.js-loto-note.is-loto6').show();
    }
    else if ( allViewModel.loto_type() === 7 ) {
      $('.js-loto-note.is-loto7').show();
    }
    else {
      $('.js-loto-note.is-loto5').show();
    }

    // 買いましのトグルボタン
    $('.js-toggle-button').on('click', function(){
      var _target = $('#'+$(this).data('href'));
      if(_target.css('display') === 'none'){
        $(this).addClass('is-open');
        _target.show();
      } else {
        $(this).removeClass('is-open');
        _target.hide();
      }
    });

    // 最初は必ずトップから
    if (location.hash) {
      location.hash = '';
    }

    // ダイアログを確認済みなら消去
    if (LocalStrage.get('showDialog')) {
      $('#js-loto-overlay').remove();
    }

    // エラーチェック
    that.errors = ko.observableArray();
    util.setError(that.errors, allViewModel.panels());

    var timerID;
    that.totalPriceStr = ko.observable(0);
    that.canSubmit = ko.observable(false);

    // カンマ付き合計金額
    ko.watch(allViewModel, {depth: -1}, function(){
      clearTimeout(timerID);
      timerID = setTimeout(function(){
        var price = util.totalPrice(allViewModel);
        that.totalPriceStr( util.addComma( price ) );
        that.canSubmit( price > 0 );
      }, 0);
    });

    // 初回実行時に合計金額を計算
    Signal.subscribe('on_init_completed', function(){
      var price = util.totalPrice(allViewModel);
      that.totalPriceStr( util.addComma( price ) );
      that.canSubmit( price > 0 );
    });

    // 銀行用
    window.createSubmitData = function() {
      AllViewModel.createSubmitData();
    };

    // サーバーに送信
    $('.js-submit').on('click', function(e){
      if ( !that.canSubmit() ) return false;
       window.createSubmitData();
    });

    // 継承クラスの場合は以下を実行しない
    if (isExtend) return;

    that.marksheetViewModel = new MarksheetViewModel();
    that.numbersViewModel   = new NumbersViewModel();

    that.init();

  }

  App.prototype = {

    init: function() {
      var that = this;

      // ハッシュルーティング
      $(window).on('hashchange', function(){
        var hash = location.hash.substr(1);
        if (hash === 'edit') {
          // 編集画面の処理
          that.$marksheet.hide();
          that.$edit.show();
        }
        else {
          // 一覧画面の処理
          that.$marksheet.show();
          that.$edit.hide();
          that.marksheetViewModel.setup();
          if ( location.hash && $(location.hash).length ) {
            window.scrollTo(0, $(location.hash).offset().top);
          }
        }
        // ナンバーviewのセットアップ
        that.numbersViewModel.setup();
      }).trigger('hashchange');

      // シグナル受信
      Signal.subscribe('on_edit', function(data){
        location.hash = '#edit';
        window.scrollTo(0, 0);
      });

      // デバッグ出力
      that.debugJson = ko.computed(function() {
        return JSON.stringify( ko.mapping.toJS(that.allViewModel), null, 2 );
      });

      Signal.notify('on_init_completed');
      that.ios6overlayFix();
    },

    closeDialog: function() {
      $('#js-loto-overlay').remove();
      LocalStrage.set('showDialog', true);
    },

    ios6overlayFix: function(){
      var data = device.get();
      if(data.name === 'iphone' && data.version.major === 6) {
        $('#js-loto-overlay').css('height', '120%');
      }
    }

  };

  return App;

})();

},{"../model/number.model":4,"../utils/LocalStrage":14,"../utils/device":15,"../utils/util":16,"./Marksheet":8,"./NumbersView":11}],7:[function(require,module,exports){
/**
 * ■■■■■■■■ Continuecount Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

var AllViewModel = require('../model/number.model');

module.exports = (function() {

  function Continuecount(){
    var that = this;
    that.viewModel = null;
    that.displayViewModel = ko.observableArray([]);
    if (window.RL.Conf.continuecount === 0) window.RL.Conf.continuecount = 1;
    for (var i = 1; i <= window.RL.Conf.continuecount; i++) {
      var text = i + '回';
      that.displayViewModel.push({text : text, value: i});
    }
    Signal.subscribe('on_change_label', function(data){
      that.setViewModel(data);
    });
    that.chosenValue = ko.observableArray([3]);
  }

  Continuecount.prototype = {

    setViewModel: function(vm) {
      var that = this;
      var count = AllViewModel.getMyPanel(vm).continuecount;
      that.viewModel = count;
      $('.js-continuation')
        .find('option')
        .removeAttr('selected')
        .end()
        .find('option[value="' + count() +'"]')
        .prop('selected', true);
    }

  };

  return Continuecount;

}());

},{"../model/number.model":4}],8:[function(require,module,exports){
/**
* ■■■■■■■■ Marksheet ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

var AllViewModel = require('../model/number.model');
var config       = require('../config/config');

//knockout.jsのカスタムバインド
require('../utils/CustomBind')();

module.exports = (function(){

  function Marksheet() {
    var that = this;
    // 全体のViewModel
    var allViewModel = that.allViewModel = that.appViewModel = AllViewModel.get();
    that.panels = AllViewModel.get().panels;

    // 表示名(A?B)をviewModelに追加する
    that.panelsComputed = ko.computed(function(){
      _(that.panels()).each(function(panel){
        _(panel.input).each(function(value, key){
          value.name = key.toUpperCase();
        });
      });
    });

    // まだ追加できるか
    that.isFull = ko.computed(function(){
      return that.panels().length >= 10;
    });

    // 予約購入回数
    if(allViewModel.auto_vote()){
      var VoteContinuationCount = require('../common/VoteContinuationCount.js');
      that.voteContinuationCount = new VoteContinuationCount(allViewModel.vote_continuation_count);
    }

    // 買いまし口数
    if (!_.isUndefined(allViewModel.add_purchase_amount)) {
      var AddPurchaseAmount = require('../common/AddPurchaseAmount');
      that.addPurchaseAmount = new AddPurchaseAmount(allViewModel.add_purchase_amount);
    }
    else {
      $('#js-kaimashi').remove();
    }

  }

  Marksheet.prototype = {

    _isEmpty: function(numbers) {
      return _.every(numbers(), function(number){
        return (number.value === '' && number.random === false);
      });
    },

    setup: function(aCallback) {
      var that = this;
      var callback = aCallback || null;

      // 初期化
      // 一旦リセットしてからパース処理
      $('.set-item-button').addClass('is-hide');
      $('.set-item-numbers').show();
      $('.set-item').removeClass('is-active');

      setTimeout(function(){
        $('.set-item-wrapper.is-empty')
          .first()
            .closest('.set-item')
            .addClass('is-active')
            .end()
          .find('.set-item-button')
            .removeClass('is-hide')
            .end()
          .find('.set-item-numbers')
            .hide();
        that.fixedNav();
        // おまかせ選択
        if (config.isAuto) {
          that.setOmakase();
        }
      }, 0);

    },

    fixedNav: function() {
      var that = this;
      that.$el = $('#js-loto-total');

      // 固定メニュー
      (function(){
        var limit;
        var isTakarakuji = (function(){
          return $('#js-takarakuji').length;
        })();
        if ($('html').hasClass('is-old-android')) {
          that.$el.css('position', 'static');
          return;
        }
        if (isTakarakuji) {
          // 宝くじ
          limit = $('#js-loto-menu').offset().top - $(window).height();
        }
        else {
          // 銀行
          limit = $('#js-fixed-control').offset().top - $(window).height();
        }
        $(window)
          .on('load scroll', function(){
            if ($(window).scrollTop() >= limit) {
              if (isTakarakuji) {
                that.$el.css('position', 'static');
              }
              else {
                that.$el.addClass('is-static redraw');
              }
            }
            else {
              if (isTakarakuji) {
                that.$el.css('position', 'fixed');
              }
              else {
                that.$el.removeClass('is-static redraw');
              }
            }
          });
        })();
    },

    onEdit: function(vm, setN, force) {
      var that = this;
      if (force || !that._isEmpty(vm.numbers)) {
        Signal.notify('on_edit', {set: setN, group: vm.name.toLowerCase()});
      }
    },

    // クイックピック追加
    onAddAuto: function(vm, setN) {
      var that = this;
      vm.auto(true);
      that.setup();
    },

    // 追加
    add: function() {
      var that = this;
      if (that.isFull()) return;
      // 強制追加する
      Signal.notify('on_add_panel', true);
      that.setup();
    },

    setOmakase: function() {
      // おまかせ選択マークを付与
      $('.set-item-numbers').each(function(){
        if ( $(this).find('.is-random-auto').length ) {
          $(this)
            .find('li')
            .each(function(){
              if ( $(this).hasClass('is-random-auto') ) {
                $(this).addClass('is-leave');
              }
              else {
                $(this).removeClass('is-leave');
              }
            });
        }
        else {
          $(this)
            .find('li')
            .each(function(){
              $(this).removeClass('is-leave');
            });
        }
      });
    }


  };

  return Marksheet;

})();

},{"../common/AddPurchaseAmount":1,"../common/VoteContinuationCount.js":2,"../config/config":3,"../model/number.model":4,"../utils/CustomBind":13}],9:[function(require,module,exports){
/**
* ■■■■■■■■ NumberNav Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

var AllViewModel = require('../model/number.model');
var config       = require('../config/config');

module.exports = (function(){

  function NumberNav(aIsExtend) {

    var that = this;
    var isExtend = aIsExtend || false;

    that.labels = ['a', 'b', 'c', 'd', 'e'];
    that.$el = $('#js-number-nav');

    // $('#js-number-nav').flickable();
    that.$el.addClass('redraw').overflowScroll();

    that.errors = function(set) {
      var targetPanel = AllViewModel.get().panels()[set];
      return _(targetPanel.input)
        .filter(function(value, key){
          return value.errors.length;
        });
    };

    that.$el.on('click', 'a.js-nav', function(e){
      e.preventDefault();
      var group = this.hash.substr(1);
      Signal.notify('on_change_group', group);
    });

    if (isExtend) return;

    // Signal受信
    Signal.subscribe('on_change_label', function(data){
      that.move(data);
      that.$el.find('li').each(function(i){
        $(this).removeClass('is-selected');
      });
      that.setCurrent(data);
      that.checkFull(data);
    });

  }

  NumberNav.prototype = {

    redraw: function() {
      var that = this;
      var _timer;
      that.$el.removeClass('redraw');
      _timer = setTimeout(function(){
        that.$el.addClass('redraw');
        clearTimeout(_timer);
      }, 200);
    },

    move: function(data){
      var that = this;
      var myIndex = _(that.labels).indexOf(data.group);
      if (myIndex <= 1) {
        that.$el.stop().animate({ scrollLeft: 0 }, 300, 'swing');
      }
      else {
        that.$el.stop().animate({ scrollLeft: 9999 }, 300, 'swing');
      }
      that.redraw();
    },

    // タブをis-selectedにする
    checkFull: function(data){
      var that = this;
      var targetInput = AllViewModel.get().panels()[data.set].input;
      var arr = _(targetInput).map(function(input, key){
        var numberLen = _(input.numbers()).filter(function(n){
          return n.value;
        }).length;
        return (numberLen === AllViewModel.get().loto_type() || input.auto());
      });
      that.$el.find('li').each(function(i){
        if (arr[i]) {
          $(this).addClass('is-selected');
          that.redraw();
        }
      });
      // おまかせ選択時
      if (config.isAuto) {
        var omakaseArr = _(targetInput).map(function(input, key){
          return _.some(input.numbers(), function(n){
            return n.random;
          });
        });
        that.$el.find('li').each(function(i){
          if (omakaseArr[i]) {
            $(this).addClass('is-selected');
            that.redraw();
          }
        });
      }
    },

    setCurrent: function(data){
      var that = this;
      var myIndex = _(that.labels).indexOf(data.group);

      that.$el.find('li').removeClass('is-error');
      if (that.errors(data.set).length) {
        _(that.errors(data.set)).each(function(obj){
          var index = _(that.labels).indexOf(obj.name.toLowerCase());
          that.$el.find('li').eq(index).addClass('is-error');
        });
      }
      else {
        that.$el.find('li').removeClass('is-error');
      }

      that.$el
        .find('li')
        .filter(function(){
          return $(this).hasClass('is-active');
        })
        .removeClass('is-active')
        .end()
        .eq(myIndex)
        .addClass('is-active');

      that.redraw();
    }

  };

  return NumberNav;

})();

},{"../config/config":3,"../model/number.model":4}],10:[function(require,module,exports){
/**
* ■■■■■■■■ Numbers ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

// 1ラベルの43個(loto6の場合)の数字コマを管理するクラス

var AllViewModel = require('../model/number.model');

module.exports = (function(){

  function Numbers(viewModel, mySet, uid) {
    var that = this;
    that.viewModel = viewModel;
    that.mySet = mySet;
    that.uid = uid;
    that.myKey = that.viewModel.name.toLowerCase();
  }

  Numbers.prototype = {

    getHTML: function() {
      var that = this;
      var str = '<div class="js-numbers numbers" data-mykey="' + that.myKey + '" data-myset="' + that.mySet + '" style="float: left;">';
      str += '<table>';
      str += '<tbody><tr>';
      // 一行は5列
      var len = Math.ceil(window.RL.Conf.totalNums / 5) * 5;
      _(len).times(function(i){
        var label = i + 1;
        var index = i % 5;
        if (index === 0 && i > 0) {
          str += '</tr><tr>';
        }
        if (i < window.RL.Conf.totalNums) {
          str += '<td class="js-n" data-key="' + that.myKey + '-' + label + '">' + label + '</td>';
        }
        else {
          str += '<td class="is-empty"></td>';
        }
      });
      str += '</tr></tbody></table>';
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

  };


  return Numbers;

})();

},{"../model/number.model":4}],11:[function(require,module,exports){
/**
* ■■■■■■■■ NumbersView Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

var AllViewModel = require('../model/number.model');
var Numbers      = require('./Numbers');
var NumberNav    = require('./NumberNav');
var SetNav       = require('./SetNav');
var LocalStrage  = require('../utils/LocalStrage');
var config       = require('../config/config');

var Continuecount = require('./Continuecount');
var Amount        = require('./Amount');

module.exports = (function(){

  function NumbersView(aIsExtend) {

    var that = this;
    var isExtend = aIsExtend || false;

    // 全体のViewModel
    var allViewModel = that.allViewModel = AllViewModel.get();

    that.labels = ['a', 'b', 'c', 'd', 'e'];
    // セットのナビゲーション
    that.setNav = new SetNav();
    // jsonのviewModel
    that.panels = AllViewModel.get().panels;
    // 現在表示しているセット番号
    that.currentSet = ko.observable(0);
    // 現在のグループID (A?E)
    that.currentGroup = ko.observable('a');
    // スワイプする数字群を格納する配列
    that.numbers = ko.observableArray();
    // ドラッグ中フラグ
    that.isDragging = false;

    // スワイプアニメのフラグ
    that.isSwiped = function(){
      if ( _.isUndefined(LocalStrage.get('isSwipeAnim')) ) {
        LocalStrage.set('isSwipeAnim', false);
      }
      return !!LocalStrage.get('isSwipeAnim');
    };

    // パネルの数
    that.panelsLen = ko.computed(function(){
      return that.panels().length;
    });

    // パネルがautoだったら
    that.isPanelAuto = ko.computed(function(){
      return that.isAuto({
        set: that.currentSet(),
        group: that.currentGroup()
      });
    });

    // セットの数字が全部入力されたかのチェック
    that.isFull = function() {
      var numbers = that.panels()[that.currentSet()].input[that.currentGroup()].numbers();
      var len = _(numbers).filter(function(n){
        return n.value;
      }).length;
      var lotoType = AllViewModel.get().loto_type();
      if (!LocalStrage.isEnable()) return;
      if (len === lotoType && !that.isSwiped()) {
        LocalStrage.set('isSwipeAnim', true);
        $('#js-overlay-anim').fadeIn('fast');
        setTimeout(function(){
          $('#js-overlay-anim').find('.overlay-anim').addClass('anim');
          setTimeout(function(){
            $('#js-overlay-anim').fadeOut('fast');
          }, 1800);
        }, 1000);
      }
    };

    // 全部手入力か（ランダム選択できない）
    that.isFullManual = ko.computed(function(){
      var target = AllViewModel.getMyPanel({
        set: that.currentSet(),
        group: that.currentGroup()
      });
      return _.every( target.numbers(), function(vm){
        return (vm.value && vm.random === false);
      });
    });

    // 残りをランダム選択
    that.lestRandomNum = ko.computed(function(){
      var target = AllViewModel.getMyPanel({
        group: that.currentGroup(),
        set  : that.currentSet()
      });
      var number = _(target.numbers()).filter(function(number){
        return number.value;
      }).length;
      var allRandom = _(target.numbers()).filter(function(number){
        return number.random;
      }).length;
      if (allRandom === number) {
        return false;
      }
      return number;
    });

    // 空チェック
    that.canReset = ko.computed(function(){
      var target = AllViewModel.getMyPanel({
        set: that.currentSet(),
        group: that.currentGroup()
      });
      if (target.auto()) return true;
      return _(target.numbers()).filter(function(n){
        return n.value;
      }).length;
    });

    // domのショートカット
    that.$numbersWrap = $('#js-numbers-wrap');
    that.$render = $('#js-numbers-inner');
    that.touchdraghfitty = null;

    // 初期化
    that._init();

    // domイベント
    $(window).on('resize', function(){
      that.setup();
    });

    var scrollTimer = false;
    $(window).on('scroll', function(){
      if (scrollTimer) {
        that.isDragging = true;
        clearTimeout(scrollTimer);
      }
      scrollTimer = setTimeout(function(){
        that.isDragging = false;
      }, 200);
    });

    that.touchPos = {
      threshold: 5
    };

    // スクロールかどうかを判定するためにtouchstartとtouchendの座標の差分をとる
    // scrollTimerの実装だけだとiOS7未満と一部のAndroid 5端末で対応が不十分
    that.$numbersWrap.on('touchstart', '.js-n', function(e){
      var touches = e.originalEvent.targetTouches[0];
      that.touchPos.startX = touches.pageX;
      that.touchPos.startY = touches.pageY;
    });

    // 数字のクリック
    that.$numbersWrap.on('touchend', '.js-n', function(e){
      e.preventDefault();
      var touches = e.originalEvent.changedTouches[0];
      var changeX = Math.abs(that.touchPos.startX - touches.pageX);
      var changeY = Math.abs(that.touchPos.startY - touches.pageY);
      var threshold = that.touchPos.threshold;
      // 上下左右のタッチの移動量が閾値以上 || スクロール中なら何もしない
      if (changeX > threshold || changeY > threshold || that.isDragging) return;
      var myKey   = $(this).data('key');
      var myGroup = myKey.split('-')[0];
      var myNum   = myKey.split('-')[1];
      that.register({ group: myGroup, number: myNum }, $(this));
      that.isFull();
    });

    // 完了ボタン
    $('#js-btn-done').on('click', function(e){
      e.preventDefault();
      location.hash = '#sets';
    });

    // 次のパネルの存在チェック
    that.hasNext = ko.computed(function(){
      return that.panelsLen() === that.currentSet() + 1;
    });

    // Signal受信
    Signal.subscribe('on_change_panel', function(nextSet){
      // ヘッダのシーン移動ナビ
      that.currentSet(nextSet);
      // 移動
      that.move({set: that.currentSet(), group: 'a'});
    });

    // Signal受信
    Signal.subscribe('on_change_group', function(group){
      that.move({set: that.currentSet(), group: group});
    });

    Signal.subscribe('on_edit', function(data){
      that.move(data);
    });

    // topページ側からのaddシグナル
    Signal.subscribe('on_add_panel', function(isForce){
      isForce = isForce || false;
      that.add(isForce);
    });

    // 継承クラスはここまで
    if (isExtend) return;

    // ナンバーナビゲーションインスタンス
    that.numberNav = new NumberNav();

    // 初期表示用にnumberのステートを変更する
    _(that.panels()).each(function(panel, index){
      _(panel.input).each(function(value, key){
        _(value.numbers()).each(function(number){
          var targetSet = index;
          var targetId = key + '-' + number.value;
          var $el = that.$render
            .find('.js-numbers[data-myset="' + index +'"]')
            .find('.js-n[data-key="' + targetId + '"]');
          if (number.value) {
            // 空で無かったらナンバーのステートを変更する
            if (number.random) {
              $el.addClass('is-random');
            }
            else {
              $el.addClass('is-selected');
            }
          }
        });
      });
    });

    // おまかせ機能フラグ
    if (config.isAuto) {
      // 初期表示用にnumberのステートを変更する
      that._setupOmakase();

      that.isOmakase = ko.computed(function(){
        var myNumbers = that.panels()[that.currentSet()].input[that.currentGroup()].numbers();
        return _.some(myNumbers, function(n){
          return n.random;
        });
      });

      that.canOmakase = ko.computed(function(){
        var myNumbers = that.panels()[that.currentSet()].input[that.currentGroup()].numbers();
        var isApplyN = function() {
          var len = _(myNumbers).filter(function(n){
            return n.value.length > 0;
          }).length;
          return (len === 0 || len >= window.RL.Model.loto_type);
        };
        return isApplyN();
      });

    }

  }

  NumbersView.prototype = {

    _setupNumbers: function() {
      var that = this;
      // 初期表示分のNumberインスタンス生成
      _(that.panels()).each(function(panel, index){
        _(that.labels.length).times(function(i){
          var uid = that.numbers().length;
          that.numbers.push( new Numbers(panel.input[that.labels[i]], index, uid) );
        });
      });
    },

    _init: function() {
      // インスタンス生成時に一度実行
      var that = this;

      // 初期表示分のNumberインスタンス生成
      that._setupNumbers();

      // 初期表示分のHTMLを生成
      var str = _(that.numbers()).reduce(function(prev, current){
        if (!_.isString(prev)) {
          prev = prev.getHTML();
        }
        return prev + current.getHTML();
      });

      // レンダー
      that.$render.html(str);

      // スワイププラグインの設定
      that.$numbersWrap.touchdraghfitty({

        inner: '#js-numbers-inner',
        item : '.js-numbers',
        triggerrefreshimmediately: false,

        beforefirstrefresh: function(){
          // 初期状態用
          Signal.notify('on_change_label', {
            group: that.currentGroup(),
            set: that.currentSet()
          });
          that.touchdraghfitty
            .on('dragstart', function(){
              // ドラッグ開始
              that.isDragging = true;
              // ドラッグしたらswipeフラグをtrueにしてアニメーションさせない
              if ( !that.isSwiped() ) {
                LocalStrage.set('isSwipeAnim', true);
              }
            })
            .on('dragend', function() {
              that.isDragging = false;
            })
            .on('indexchange', function(data) {
              that.isDragging = false;
              // スワイプ後のイベント
              // dataは連番のindexが入る
              var index = data.index;
              // 現在のセットを取得
              var targetSet = that.$numbersWrap.find('.js-numbers').eq(index).data('myset');

              // vmにセット
              that.oldSet = that.currentSet(); // 前のセットをメモリ
              that.currentSet(targetSet);
              if (that.oldSet !== that.currentSet()) {
                Signal.notify('on_change_set', {
                  group: that.currentGroup(),
                  set: that.currentSet()
                });
              }
              that.currentGroup(that.labels[index % 5]);
              // Signal発信
              Signal.notify('on_change_label', {
                group: that.currentGroup(),
                set: that.currentSet()
              });
            });
        }
      });

      that.touchdraghfitty = that.$numbersWrap.data('touchdraghfitty');

      // 継続回数のセットアップ
      if (!that.allViewModel.auto_vote()) {
        that.continuecount = new Continuecount();
      }
      else {
        $('.js-continuation').remove();
        that.continuecount = false;
      }

      // 購入口数
      that.amount = new Amount();

      // Androidのバージョン判定
      that._isA2();
    },

    _isA2: function() {
      var that = this;
      var ua = navigator.userAgent;
      if ( ua.indexOf('Android') > 0 ) {
        var v = Math.floor( parseFloat(ua.slice(ua.indexOf("Android")+8)) );
        if (v < 4) {
          $('html').addClass('is-old-android');
        }
      }
    },

    _getNumbersInstanceIndex: function(data) {
      var that = this;
      return _(that.numbers())
        .chain()
        .filter(function(number){
          return number.mySet === data.set && number.myKey === data.group;
        })
        .map(function(number){
          return number.uid;
        })
        .value()[0];
    },

    _isRegistered: function(numbers, registerNumber) {
      return _(numbers())
        .chain()
        .map(function(number){
          return number.value;
        })
        .contains(registerNumber)
        .value();
    },

    _getEmptyNumber: function(numbers) {
      return _(numbers()).filter(function(number){
        return !number.value;
      })[0];
    },

    _getEmptyNumberIndex: function(aNumbers) {
      var ret = null;
      var numbers = aNumbers();
      var number;
      for (var i = 0, len = numbers.length; i < len; i++) {
        number = numbers[i];
        if ( number.value === '' && number.random === false) {
          ret = i;
          break;
        }
      }
      return ret;
    },

    _removeNumber: function(aNumbers, registerNumber, callback) {
      callback = callback || function(){};
      var index = null;
      var numbers = aNumbers();
      var number;
      for (var i = 0, len = numbers.length; i < len; i++) {
        number = numbers[i];
        if (number.value === registerNumber) {
          index = i;
          break;
        }
      }
      // vmをアップデート
      aNumbers.splice(index, 1, {value: '', random: false});
      callback();
    },

    isAuto: function(data) {
      var that = this;
      var tartgetPanel = that.panels()[data.set].input;
      return _(tartgetPanel)
        .filter(function(value, key){
          return key === data.group;
        })
        .filter(function(value, key){
          return value.auto();
        }).length;
    },

    move: function(data){
      var that = this;
      // data: Object {set: 0, group: "e"}
      data.group = data.group || 'a';
      var targetId = that._getNumbersInstanceIndex(data);
      that.touchdraghfitty.to(targetId, true);
    },

    // リフレッシュ
    setup: function() {

      var that = this;
      var myNumbers;

      // プラグインのリフレッシュ
      that.$numbersWrap.data('touchdraghfitty').refresh();

      // クイックピック処理
      that.$render.find('.js-numbers').each(function(){
        var setN = $(this).closest('.js-numbers').data('myset');
        var myKey = $(this).closest('.js-numbers').data('mykey');
        if (that.isAuto({set:setN, group:myKey})) {
          // autoだったら
          $(this).find('.js-quickpic').addClass('is-on');
        }
        else {
          $(this).find('.js-quickpic').removeClass('is-on');
        }
      });

      var data = {
        group: that.currentGroup(),
        set  : that.currentSet()
      };
      // 継続回数にviewModelをセットアップ
      if (that.continuecount) {
        that.continuecount.setViewModel({
          group: that.currentGroup(),
          set  : that.currentSet()
        });
      }
      // 購入口数にviewModelをセットアップ
      that.amount.setViewModel({
        group: that.currentGroup(),
        set  : that.currentSet()
      });

      // 登録されたナンバーが空のときだけ実行
      myNumbers = that.panels()[that.currentSet()].input[data.group].numbers;
      var hasValuesLength = _(myNumbers()).filter(function(n){
        return n.value;
      }).length;
      if (!hasValuesLength) {
        $('#js-loto-overlay').show();
      }
    },

    // 登録
    register: function(data, $target) {
      var that = this;
      var myNumbers = that.panels()[that.currentSet()].input[data.group].numbers;
      // numberが空のvalueのもの
      var isRegistered = that._isRegistered(myNumbers, data.number);
      var emptyIndex = that._getEmptyNumberIndex(myNumbers);
      if (!isRegistered && !_.isNull(emptyIndex) ) {
        // vmをアップデート
        myNumbers.splice(emptyIndex, 1, {value: data.number, random: false});
        // 登録処理
        if ($target) {
          $target.addClass('is-selected');
        }
      }
      else if (isRegistered) {
        // 登録削除
        that._removeNumber(myNumbers, data.number);
        $target.removeClass('is-selected');
        $target.removeClass('is-random');
      }
    },

    // input追加
    add: function(isForce, aNumberCls) {

      var that = this;
      var panel = null;
      var addArr = [];
      var str = '';
      var newSet = null;
      var NumberCls = aNumberCls || null;

      isForce = isForce || false;

      // 次があったらaddさせない
      if ( !that.hasNext() && !isForce ) return;

      // 10セットまでしか追加できない
      if (that.panels().length >= 10) {
        return;
      }
      // viewModelに新たにpanelを追加する
      AllViewModel.addPanel();
      // 追加するviewModel
      newSet = that.panels().length - 1;
      panel = that.panels()[newSet];

      // Numberインスタンスを追加
      _(that.labels.length).times(function(i){
        var length = that.numbers().length;
        var target = panel.input[that.labels[i]];
        var number = null;
        target.name = that.labels[i];
        number = new Numbers(target, newSet, length);
        addArr.push(number);
        that.numbers.push(number);
        str += number.getHTML();
      });

      that.$render.append(str);
      that.touchdraghfitty.refresh();
      that.move({set: newSet, group: 'a'});

    },

    // リセット
    reset: function() {
      var that = this;
      var target = that.panels()[that.currentSet()].input[that.currentGroup()];
      var $el = that.$render.find('.js-numbers[data-myset="' + that.currentSet() +'"]');
      var tmp = [];
      target.auto(false);
      target.amount(1);
      target.continuecount(1);
      _(window.RL.Model.loto_type).times(function(i){
        tmp.push({value: '', random: false});
      });
      target.numbers.removeAll();
      target.numbers(tmp);
       // ナンバーのステートをリセットする
      $el.each(function(i, el){
        if ($(el).data('mykey') === that.currentGroup()) {
          $(el).find('.js-n').removeClass('is-selected').removeClass('is-random');
        }
      });
      // リフレッシュする
      that.setup();
    },

    // ランダム
    random: function() {
      var that = this;
      var target = that.panels()[that.currentSet()].input[that.currentGroup()];

      // クイックピック選択中ならリターン
      if (target.auto()) return;
      var tmpArr = target.numbers().concat();
      // ランダムがtrueのアイテムのvalueをfalseにする
      _(tmpArr)
        .chain()
        .filter(function(number){
          return number.random;
        })
        .each(function(number){
          number.value = '';
          number.random = false;
        });
      // 登録された数字の配列
      var registerArr = _(target.numbers())
        .chain()
        .filter(function (number) {
          return number.value.length > 0;
        })
        .map(function (number) {
          return number.value;
        })
        .value();
      var max = that.allViewModel.loto_type() - registerArr.length;
      if (max <= 0) return;
      var randomArr = [];
      (function random() {
        var rand = ( _.random(1, window.RL.Conf.totalNums) ) + '';
        if ( _.include(registerArr, rand) || _.include(randomArr, rand) ) {
          random();
          return;
        }
        randomArr.push(rand);
        max--;
        if (max > 0) random();
      })();
      // ランダム値をセット
      _(tmpArr)
        .chain()
        .filter(function(number) {
          return number.value === '';
        })
        .each(function(number, i) {
          number.random = true;
          number.value = randomArr[i];
        });

      target.numbers.removeAll();
      target.numbers( tmpArr );

      // domに反映
      var $el = that.$render.find('.js-numbers[data-myset="' + that.currentSet() +'"]');
      $el.each(function(i, el){
        if ($(el).data('mykey') === that.currentGroup()) {
          $(el).find('.js-n').removeClass('is-random');
          _(randomArr).each(function(random){
            $(el)
              .find('.js-n[data-key="' + that.currentGroup() + '-' + random + '"]')
              .addClass('is-random');
          });
        }
      });

      // リフレッシュ
      that.setup();
      // フルチェック
      that.isFull();
    },

    _setupOmakase: function() {
      var that = this;
      function hasOmakase(panelIndex, key) {
        var targetNumbers = that.panels()[panelIndex].input[key].numbers();
        return _.some(targetNumbers, function(n){
          return n.random;
        });
      }
      // 初期表示用にnumberのステートを変更する
      $('.js-numbers').each(function(){
        var myset = $(this).data('myset');
        var mykey = $(this).data('mykey');
        if ( hasOmakase(myset, mykey) ) {
          $(this).find('.js-leave').addClass('is-on');
        }
        else {
          $(this).find('.js-leave').removeClass('is-on');
        }
      });
    },

    // おまかせ
    omakase: function() {
      var that = this;
      var myNumbers = that.panels()[that.currentSet()].input[that.currentGroup()].numbers();
      var myNumbersVM = that.panels()[that.currentSet()].input[that.currentGroup()].numbers;
      var tmpArr = myNumbers.concat();

      if (that.isOmakase()) {
        // 解除
        _(tmpArr).each(function(n){
          n.random = false;
        });
      }
      else {
        // 設定
        _(tmpArr).each(function(n){
          if (n.value.length === 0) {
            n.random = true;
          }
        });
      }
      myNumbersVM( $.extend(true, [], tmpArr) );
      that._setupOmakase();
    },

  };

  return NumbersView;

})();

},{"../config/config":3,"../model/number.model":4,"../utils/LocalStrage":14,"./Amount":5,"./Continuecount":7,"./NumberNav":9,"./Numbers":10,"./SetNav":12}],12:[function(require,module,exports){
/**
* ■■■■■■■■ SetNav Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

var AllViewModel = require('../model/number.model');

module.exports = (function(){

  function SetNav() {
    var that = this;
    that.$el = $('#js-set-nav');
    that.$nav = that.$el.find('li').find('a');
    that.currentSet = 0;
    that.panels = AllViewModel.get().panels;

    // domイベント
    that.$nav.on('click', function(e){
      e.preventDefault();
      that._move( this.hash.substr(1) );
    });

    // シグナル受信
    Signal.subscribe('on_change_label', function(data){
      if (data.set !== that.currentSet) {
        that._setCurrent(data.set);
      }
    });

    // 初期化
    that._setCurrent(0);

  }

  SetNav.prototype = {

    _setCurrent: function(set) {
      var that = this;
      var len = that.panels().length;
      that.currentSet = set;
      that.$nav.removeClass('is-off');
      if (len <= 1) {
        that.$nav.addClass('is-off');
      }
      else if (that.currentSet === 0) {
        that.$el.find('a[href="#prev"]').addClass('is-off');
      }
      else if (that.currentSet >= len - 1) {
        that.$el.find('a[href="#next"]').addClass('is-off');
      }
    },

    _move: function(direction) {
      var that = this;
      var len = that.panels().length;
      var nextSet;
      if (that.currentSet === 0 && direction === 'prev') {
        return;
      }
      else if ( that.currentSet + 1 >= len && direction === 'next' ) {
        return;
      }
      nextSet = direction === 'prev' ? that.currentSet - 1 : that.currentSet + 1;
      // Signal発信 パネルが変わった
      Signal.notify('on_change_panel', nextSet);
    }

  };

  return SetNav;

})();

},{"../model/number.model":4}],13:[function(require,module,exports){
/**
* ■■■■■■■■ knockout.jsのカスタムバインド ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

module.exports = function(){

  ko.bindingHandlers.hasValue = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {},
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      function hasValue(){
        return _(valueAccessor()())
          .chain()
          .filter(function(v){
            return v.value.length > 0;
          })
          .value()
          .length;
      }
      if (hasValue()) {
        $(element).show();
      }
      else {
        $(element).hide();
      }
    }
  };

  ko.bindingHandlers.isEmpty = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {},
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var isAuto = valueAccessor().auto();
      var numbers = valueAccessor().numbers();
      function hasValue(){
        return _(numbers)
          .chain()
          .filter(function(v){
            return v.value.length > 0;
          })
          .value()
          .length;
      }
      if (hasValue() || isAuto){
        $(element).removeClass('is-empty');
      }
      else {
        $(element).addClass('is-empty');
      }
    }
  };

};

},{}],14:[function(require,module,exports){
/**
 * ■■■■■■■■ LocalStrage Class ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
 */

var LocalStrage = (function() {

  var instance;
  var ns = 'RL';
  var enable = true;

  function LocalStrage() {
    var that = this;
    // 空のネームスペース付きlsを保存
    // root以下にすべて保存
    if (!that.getNs()) {
      var obj = {root:{}};
      try {
        localStorage.setItem( ns, JSON.stringify(obj) );
      }
      catch (e) {
        enable = false;
        console.error('LocalStrageに対応していません');
      }
    }
  }

  LocalStrage.prototype = {

    isEnable: function () {
      return enable;
    },

    set: function(key, value) {
      var that = this;
      var obj = that.getNs();
      if (obj) {
        obj.root[key] = value;
      }
      try {
        localStorage.setItem(ns, JSON.stringify(obj));
      }
      catch (e) {}
    },

    get: function(key) {
      var that = this;
      var obj = that.getNs();
      if (obj) {
        return obj.root[key];
      }

    },

    getNs: function() {
      try {
        return JSON.parse( localStorage.getItem(ns) );
      }
      catch (e) {
        return false;
      }

    }

  };

  return {
    getInstance: function() {
      if (!instance) {
        instance = new LocalStrage();
      }
      return instance;
    }
  };

}());

module.exports = LocalStrage.getInstance();

},{}],15:[function(require,module,exports){
// モバイル端末のバージョンをSemVar形式で返す
module.exports.get = function () {
  'use strict';

  var ua = navigator.userAgent.toLowerCase();
  var device = {
    name: '',
    version: {
      major: 0,
      minor: 0,
      patch: 0
    }
  };

  function _getVersion(ua, token, delimiter) {
    var verArr = ua.split(token)[1].trim().split(/[^\w\.]/)[0].split(delimiter);

    return {
      major: parseInt(verArr[0], 10) || 0,
      minor: parseInt(verArr[1], 10) || 0,
      patch: parseInt(verArr[2], 10) || 0
    };
  }

  if(/iphone/.test(ua)) {
    device.name = 'iphone';
    device.version = _getVersion(ua, 'iphone os', '_');
  } else if(/android/.test(ua)){
    device.name = 'android';
    device.version = _getVersion(ua, 'android', '.');
  }

  return device;
};

},{}],16:[function(require,module,exports){
// 3桁ごとにカンマをつける
module.exports.addComma = function (aNum) {
  var num = (aNum + '').replace( /^(-?\d+)(\d{3})/, "$1,$2" );
  if(num !== aNum) {
    return arguments.callee(num);
  }
  return num;
};

// エラー設定
module.exports.setError = function (errors, arr) {
  var tmp = [];
  _(arr).each(function(item, i) {
    _(item.input).each(function(o, j) {
      if (o.errors.length) {
        var strObj = {};
        strObj.title = (i + 1) + '番目の組合せ' + (j.toUpperCase());
        strObj.errs = o.errors;
        tmp.push(strObj);
      }
    });
  });
  ko.utils.arrayPushAll(errors, tmp);
};

// 数字入力合計金額
module.exports.totalPrice = function(allViewModel) {
  var totalPrice = 0;
  var price      = allViewModel.unit_price();
  var arr        = ko.mapping.toJS(allViewModel.panels());
  _(arr).each(function(panel, i) {
    _(panel.input).some(function(obj, j) {
      var amountCount = obj.amount;
      var continueCount = allViewModel.auto_vote() ? null : obj.continuecount;
      var registerArr = _(obj.numbers).filter(function(number) {
        return number.value;
      });
      if(obj.auto || registerArr.length) {
        if (_.isNull(continueCount)) {
          totalPrice += price * amountCount;
        }
        else {
          totalPrice += price * amountCount * continueCount;
        }
        return false;
      }
    });
  });
  return totalPrice;
};

//マークシート合計金額
module.exports.totalPriceM = function(appViewModel) {
  var totalPrice = 0;
  var price = appViewModel.unit_price();
  var arr = ko.mapping.toJS(appViewModel.panels());
  _(arr).each(function(value, i) {
    var ticketCount = 0;
    var amountCount = 0;
    var continueCount = 0;
    _(value.input).each(function(value) {
      if (value.auto) {
        ticketCount++;
      }
      else {
        (function() {
          var count = 0;
          _(value.numbers).each(function(n) {
            if (n.value) count++;
          });
          if (count) ticketCount++;
        }());
      }
    });
    amountCount += value.setting.amount;
    continueCount += value.setting.continuecount;
    // 通常購入のみcontinueCountを追加
    if (appViewModel.auto_vote()) {
      totalPrice += price * ticketCount * amountCount;
    }
    else {
      totalPrice += price * ticketCount * amountCount * continueCount;
    }
  });
  return totalPrice;
};

// input:hiddenを作成して返す
module.exports.createInputHidden = function(name, value, cls) {
  var $input = $('<input type="hidden" name="' + name + '" value="' + value + '">');
  if (cls) $input.addClass(cls);
  return $input;
};

// おまかせ選択チェック
module.exports.isOmakase = function(vm) {
  return _(vm.numbers()).filter(function(v){
    return v.random();
  }).length;
};

// valueがあるかチェック
module.exports.hasValue = function(vm) {
  return _(vm.numbers()).filter(function(n){
    return n.value();
  }).length;
};

// すべてrandomか返す
module.exports.getRandoms = function(vm) {
  return _(vm.numbers()).filter(function(n){
    return n.random();
  });
};

// 非同期ループ
module.exports.asyncLoop = function(arg, aChunkSize, onProsess) {
  var isArray   = $.isArray(arg);
  var length    = isArray ? arg.length : arg * 1;
  var chunkSize = aChunkSize;
  var iteration = 0;
  var defer     = $.Deferred();
  setTimeout(function loop(){
    for (var i = 0; i < chunkSize; i++) {
      onProsess( isArray ? arg[iteration] : null, iteration, i );
      iteration++;
      if (iteration >= length) break;
    }
    (iteration < length) ? setTimeout(loop, 0) : defer.resolve();
  }, 0);
  return defer.promise();
};

// ランダム数生成
module.exports.createRandom = function(aLimit, aMax, aIgnoresArr) {
  var limit = aLimit;
  var max = aMax;
  var ignoresArr = aIgnoresArr;
  var arr = [];
  return function() {
    (function gen(){
      var rand = ( _.random(1, max) );
      if ( _.include(arr, rand) || _.include(ignoresArr, rand) ) {
        gen();
      }
      if (arr.length < limit) {
        arr.push(rand);
        gen();
      }
      return;
    })();
    return arr;
  };
};

// リセット
module.exports.reset = function(times, vm, isAuto) {
  var arr = [];
  _(times).times(function(){
    arr.push({value: '', random: false});
  });
  vm.auto( isAuto );
  vm.numbers(arr);
};

},{}],17:[function(require,module,exports){
/**
* ■■■■■■■■ run app ■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/

var Config       = require('./common/config/config');
var App          = require('./common/sp/App');
var AllViewModel = require('./common/model/number.model');

$(function(){

  Config.setCategory('bank-sp');
  AllViewModel.setup();
  Config.setIsAuto( !!AllViewModel.get().auto_vote() );
  Config.setLotoType( AllViewModel.get().loto_type() );
  ko.applyBindings( new App() );

  (function(){
    if ( !$('.js-display-mynumber').length ) return;
    $('.js-display-mynumber').on('click', function(e){
      e.preventDefault();
      if ( window.confirm('選択した内容は保存されません。\n移動してもよろしいですか？') ) {
        location.href = $(this).attr('href');
      }
    });
  })();

  // Androidバグ対策
  $(window).scroll();

});

},{"./common/config/config":3,"./common/model/number.model":4,"./common/sp/App":6}]},{},[17]);
