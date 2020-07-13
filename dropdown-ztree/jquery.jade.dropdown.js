/*
 select插件：下拉单选、多选
 Date：2020-06-10
 Author:chm

 settings 参数说明
 -----
 zNodes: [],                    //填充下拉树的数据
 treeSetting:{},              //组件中的树形结构是使用过ztree构造，需传入配置参数，具体参数api可参考http://www.treejs.cn/v3/api.php
 search: false,                //是否支持搜索,默认是false
 expandFlag:false,                  //是否全部展开,
 multiple: {
    enable: false,            //是否多选，默认是false
    btnShow: [true, false],   //多选模式下操作按钮是否显示[清除,全选],默认为[true,false]
}
selectFunc:null,              //选中的回调函数function(result)参数result是最后选择的结果集，表现形式是json数组
------------------------------- */
;(function($, window, document, undefined) {
  'use strict'
  var _cid = 0;

  var beforeClick = function(treeId, treeNode) {
    var zTree = $.fn.zTree.getZTreeObj(treeId)
    zTree.checkNode(treeNode, !treeNode.checked, null, true)
    return true
  }
  //设置颜色
  var getFontCss = function(treeId, treeNode) {
    return !!treeNode.highlight
      ? { color: '#1991eb', 'font-weight': 'bold' }
      : { color: '#333', 'font-weight': 'normal' }
  }
  // 单击节点
  var onClick = function(e, treeId, treeNode) {
    var zTree = $.fn.zTree.getZTreeObj(treeId);
    var nodes = zTree.getSelectedNodes();
    this.opts.selectFunc && this.opts.selectFunc(nodes);
    this.hideDp()
  }

  // 将 展开按钮 转移到 <a> 标签内
  function addDiyDom(treeId, treeNode) {
    var spaceWidth = 10;
    var zTree = $.fn.zTree.getZTreeObj(treeId);
    var treeObj = zTree.setting.treeObj;
    var switchObj = treeObj.find("#" + treeNode.tId + "_switch"),
        checkObj = treeObj.find("#" + treeNode.tId + "_check"),
        icoObj = treeObj.find("#" + treeNode.tId + "_ico");
    switchObj.remove();
    checkObj.remove();
    icoObj.before(switchObj);
    icoObj.before(checkObj);
    if (treeNode.level > 0) {
      var spaceStr = "<span style='display: inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
      switchObj.before(spaceStr);
    }
  }
  var preValue = '',clickCount = 0;
  var sNodeList = [];
  //清空搜索条件，ztree树折叠
  // var searchClear = function(zTree) {
  //   updateNodes(zTree,false)
  //   sNodeList = []
  //   callNumber(zTree)
  // }
  //键盘释放：当输入框的键盘按键被松开时，把查询到的数据结果显示在标签中
  var callNumber = function(zTree,inputDom,numDom) {

    //如果结果有值，则显示比例；如果结果为0，则显示"[0/0]"；如果结果为空，则清空标签框；
    if (sNodeList.length) {
      //让结果集里边的第一个获取焦点（主要为了设置背景色），再把焦点返回给搜索框
      zTree.selectNode(sNodeList[0], false) //当搜索项很多时会出现中文输入截断的bug，所以屏蔽
      inputDom.focus()

      clickCount = 1 //防止重新输入的搜索信息的时候，没有清空上一次记录

      //显示当前所在的是第一条
      numDom.html(
        '[' + clickCount + '/' + sNodeList.length + ']'
      )
    } else if (sNodeList.length == 0) {
      numDom.html('[0/0]')
      zTree && zTree.cancelSelectedNode() //取消焦点
    }
    //如果输入框中没有搜索内容，则清空标签框
    if (inputDom.val() == '') {
      numDom.html('')
      treeObj && treeObj.cancelSelectedNode()
    }
  }
  var searchNode = function(zTree,value,preValue) {
    var keyType = 'name';

    if (preValue === value) return
    preValue = value
    updateNodes(zTree,sNodeList,false)
    if (value === '') return
    sNodeList = zTree.getNodesByParamFuzzy(keyType, value) //调用ztree的模糊查询功能，得到符合条件的节点
    updateNodes(zTree,sNodeList,true) //更新节点
  }
  //高亮显示被搜索到的节点
  var updateNodes= function(zTree,highlight) {
    for (var i = 0, l = sNodeList.length; i < l; i++) {
      sNodeList[i].highlight = highlight //高亮显示搜索到的节点(highlight是自己设置的一个属性)
      zTree.expandNode(sNodeList[i].getParentNode(), true, false, false) //将搜索到的节点的父节点展开
      zTree.updateNode(sNodeList[i]) //更新节点数据，主要用于该节点显示属性的更新
    }
  }
  //点击向上按钮时，将焦点移向上一条数据
  var clickUp = function(zTree) {

    //如果焦点已经移动到了最后一条数据上，就返回第一条重新开始，否则继续移动到下一条
    if (sNodeList.length == 0) {
      // alert("没有搜索结果！");
      return
    } else if (clickCount == 1) {
      // alert("您已位于第一条记录上！");
      return
    } else {
      zTree.cancelSelectedNode()
      clickCount--
      //让结果集里边的第一个获取焦点（主要为了设置背景色），再把焦点返回给搜索框
      zTree.selectNode(sNodeList[clickCount - 1], false)
    }
    
    clickCount = clickCount
  }
  //点击向上按钮时，将焦点移向下一条数据
  var clickDown = function(zTree) {
    //如果焦点已经移动到了最后一条数据上，则提示用户（或者返回第一条重新开始），否则继续移动到下一条
    if (sNodeList.length == 0) {
      // alert("没有搜索结果！");
      return
    } else if (sNodeList.length == clickCount) {
      // alert("您已位于最后一条记录上！")
      return
    } else {
      zTree.cancelSelectedNode()
      clickCount++
      //让结果集里边的第一个获取焦点（主要为了设置背景色），再把焦点返回给搜索框
      zTree.selectNode(sNodeList[clickCount - 1], false)
    }

    clickCount = clickCount
  }

  var defaults = {
    zNodesUrl: null,
    zNodes: null,
    search: false,
    className: '',
    multiple: {
      enable: false,
      btnShow: [true, false]
    },
    selectFunc:null,
    treeSetting: {
      check: {
        enable: false,
        chkboxType: { Y: '', N: '' }
      },
      view: {
        showIcon: false,
        fontCss:getFontCss,
				//addDiyDom: addDiyDom
      },
      data: {
        simpleData: {
          enable: true
        }
      },
      callback: {
        beforeClick: beforeClick
      }
    }
  }

  function JadeDropdown(ele, opts) {
    this._cid = _cid++;
    this.ele = ele
    this.opts = $.extend(true, {}, defaults, opts)
    this._init()
  }
  JadeDropdown.prototype = {
    _init: function() {
      var that = this,
        $this = this.ele
      that._render()
      that.ele.click(function(e) {
        if (that.$el.is(':hidden')) {
          that.showDp()
        } else {
          that.hideDp()
        }
      })
    },
    _render: function() {
      var that = this;
      var id = that.ele.attr('id');
      that.eleId = id;
      that.dropdownId = that.eleId + that._cid;
      that.treeId = id + that._cid+'_tree';
      var $el = $(
        "<div id='" + that.dropdownId + "' class='jade-dropdown " + that.opts.className + "'>" +
            "<div class='dropdown-search'>" +
                "<input type='text' class='search-input' placeholder='请输入搜索内容...'/>" +
                " <div class='search-handle'>" +
                    "<label class='search-result-num'></label>" +
                    '<div class="seacth-btn-wrap">' +
                        "<a class='search-hadle-btn search-up-btn'></a>" +
                        "<a class='search-hadle-btn search-down-btn'></a>" +
                    '</div>' +
                '</div> ' +
            '</div>'+
            "<div class='dropdown-main'><ul class='ztree' id='" + that.treeId + "'></ul></div>" +
        '</div>'
      ).css({
        width:that.ele.outerWidth(),
        left:that.ele.offset().left + "px",
        top:that.ele.offset().top + that.ele.outerHeight() + "px"}
        );


      if (!that.opts.search) $el.find('.dropdown-search').remove()
      if (that.opts.multiple.enable) {
          var handleBtnEl = "<div class='dropdown-btn'>";
          if(that.opts.multiple.btnShow[0]) handleBtnEl += "<button type='button' class='clear-btn'>清除</button>";
          if(that.opts.multiple.btnShow[1]) handleBtnEl += "<button type='button' class='select-all-btn'>全选</button>";
          handleBtnEl += "<button type='button' class='sure-btn '>确定</button></div>"
          $el.append(handleBtnEl);
          that.opts.treeSetting.check.enable = true;
      } else{
        that.opts.treeSetting.callback.onClick = onClick.bind(that)
      }

      $.extend(this, {
        $el: $el,
        $dpTreeSearchInput: $el.find('.search-input'),
        $dpTreeSearchUpBtn: $el.find('.search-up-btn'),
        $dpTreeSearchDownBtn: $el.find('.search-down-btn'),
        $dpTreeSearchResultNum: $el.find('.search-result-num'),
        $dpTreeUl: $el.find('#' + that.treeId),
        $dpTreeSureBtn: $el.find('.sure-btn'),
        $dpTreeClearBtn: $el.find('.clear-btn'),
        $dpTreeSelectAllBtn: $el.find('.select-all-btn')
      })

     if (that.opts.zNodes) {
        $.fn.zTree.init(that.$dpTreeUl,that.opts.treeSetting,that.opts.zNodes)
      } else {
        $.fn.zTree.init(that.$dpTreeUl, that.opts.treeSetting)
      }
    if(that.opts.expandFlag) {
      var zTree = $.fn.zTree.getZTreeObj(that.treeId);
      zTree.expandAll(true)
    }
      $("body").append(that.$el)

      that._initEvents()
    },
    _initEvents: function() {
      var that = this,cpLock = false;
      that.$el.click(function(e){
        e.stopPropagation();
      })
      // 点击确定按钮
      that.$dpTreeSureBtn.click(function(e) {
        e.stopPropagation()
        var zTree = $.fn.zTree.getZTreeObj(that.treeId);
        var nodes = zTree.getCheckedNodes()
        that.opts.selectFunc && that.opts.selectFunc(nodes)
        that.hideDp()
      })
      // 点击清除按钮
      that.$dpTreeClearBtn.click(function(e) {
        e.stopPropagation()
        var zTree = $.fn.zTree.getZTreeObj(that.treeId);
        // 取消当前所有被选中节点的选中状态
        var nodes = zTree.getCheckedNodes()
        for (var i = 0, l = nodes.length; i < l; i++) {
          zTree.checkNode(nodes[i], false, false)
        }
      })
      //点击全选按钮
      that.$dpTreeSelectAllBtn.click(function() {
        var zTree = $.fn.zTree.getZTreeObj(that.treeId);
        zTree.checkAllNodes(true)
      })
      that.$dpTreeSearchInput
        .on('compositionstart', function() {
          cpLock = true
        })
        .on('compositionend', function() {
          cpLock = false
          $(this).attr('title', $(this).val())
          if (!cpLock) {
            that.search.call(that)
          }
        })
        .on('input propertychange', function() {
          if (!cpLock) {
            that.search.call(that)
          }
        })
      that.$dpTreeSearchUpBtn.on('click', function() {
        var zTree = $.fn.zTree.getZTreeObj(that.treeId);
        clickUp(zTree,sNodeList)
        that.$dpTreeSearchInput.focus()
        //显示当前所在的是条数
        that.$dpTreeSearchResultNum.html(
          '[' + clickCount + '/' + sNodeList.length + ']'
        )
      })
      that.$dpTreeSearchDownBtn.on('click', function() {
        var zTree = $.fn.zTree.getZTreeObj(that.treeId);
        clickDown(zTree,sNodeList)
        that.$dpTreeSearchInput.focus()
        //显示当前所在的是条数
        that.$dpTreeSearchResultNum.html(
          '[' + clickCount + '/' + sNodeList.length + ']'
        )
      })      
    },
    search(){
      var zTree = $.fn.zTree.getZTreeObj(this.treeId);
      var v = this.$dpTreeSearchInput.val();
      searchNode(zTree,v,preValue)
      callNumber(zTree,this.$dpTreeSearchInput,this.$dpTreeSearchResultNum)
    },
    showDp:function(){
      var that=this;
      that.$el.show()
      //点击body关闭下拉框弹出层
      $("body").on("click."+that.dropdownId,function(){
        if (event.target.id != that.dropdownId && event.target.id != that.eleId) {
          that.hideDp();
        }
      })
    },
    hideDp: function() {
      this.$el.hide();
      $("body").off("click."+this.dropdownId)
    }
  }
  $.fn.jadeDropdown = function(opts) {
    return new JadeDropdown($(this), opts)
  }
})(jQuery)
