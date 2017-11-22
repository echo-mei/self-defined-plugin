/**
 * Created by Administrator on 2017/10/20.
 */
$(function () {
    var textWidth = function(text){
        var sensor = $('<pre>'+ text +'</pre>').css({display: 'none'});
        $('body').append(sensor);
        var width = sensor.width();
        sensor.remove();
        return width;
    };
    function inputWidthAuto($obj) {
        var realWidth = textWidth($obj.val())+12;
        var cssWidth = $obj.parent("li").width()-32;
        if (realWidth<cssWidth){
            $obj.width(realWidth);
        }
        else {
            $obj.width(cssWidth);
        }
    }


    $(window).resize(function () {
        $("#search_common input").each(function () {
            inputWidthAuto($(this));
        });
    }).resize();


    // 常用查询里面的子项右键效果
    $("#search_common .search-list li .operate-icon").each(function(i,item) {
        $(item).contextPopup({
            items: [
                {label:'加载', action:function() { alert('加载') } },
                {label:'重命名', action:function() {
                    $(item).siblings("input").removeAttr("readonly")
                        .select()
                        .focus()
                        .addClass("borderOne");
                    $(item).parents("li").siblings().find("input").removeClass("borderOne");
                    //input失焦
                    $(item).siblings("input").blur(function(e){
                        $(item).siblings("input").attr("readonly","readonly");
                        $(item).siblings("input").removeClass("borderOne");
                        inputWidthAuto($(item).siblings("input"));
                    });
                    $(document).keyup(function(event){
                        if(event.keyCode ==13){
                            $(item).siblings("input").trigger("blur");
                        }
                    })
                } },
                {label:'固定',action:function() {
                    if ($(item).children(".lock-icon").length <= 0){
                        $(item).append(" <i class='lock-icon'></i>");
                    }
                 } },
                {label:'删除',action:function() {
                    $(item).parent("li").remove();
                } }
            ]
        });
    });
    //常用查询的更多选项点击事件
    $("#search_common .search-more").click(function (e) {
        e.stopPropagation();
        var activeClass = $(this).hasClass("search-less");
        if (activeClass) {
            $(this).parent("div.search-block").animate({height: "35px"}, 500);
            $(this).removeClass("search-less");
        } else {
            var ulHeight = $(this).siblings("ul").height();
            $(this).parent("div.search-block").animate({height: ulHeight+10}, 500);
            $(this).addClass("search-less");
        }
    });


    //点击表单查询按钮: 保留常用查询其他隐藏
    $("#search_form_btn").click(function () {
        foldSearchMain();
    });
    $("#fold").click(function () {
        if ($(this).hasClass("fold")){
            unfoldSearchMain();
        }else {
            foldSearchMain();
        }
    });
    //折叠主要的查询区域
    function foldSearchMain() {
        //自定义查询隐藏部分：筛选条件和信息查询表单
        $("#search_main").hide();
        //自定义统计隐藏部分：统计条件
        $("#statistics_form").hide();

        //折叠按钮样式及文字变换
        $("#fold").addClass("fold");
        $("#fold").text("展开");
        $("#search_common").find(".search-block").prepend($("#fold"));
    }
    //展开主要的查询区域（筛选条件和信息查询表单）
    function unfoldSearchMain() {
        //自定义查询显示部分：筛选条件和信息查询表单
        $("#search_main").show();
        //自定义统计显示部分：统计条件
        $("#statistics_form").show();

        //折叠按钮样式及文字变换
        $("#fold").removeClass("fold");
        $("#fold").text("收起");
        $("#search_main").after($("#fold"));
    }

    // 姓名查询可输入多值
   $("#sf-name").multiInput();

    /*************多选下拉树(使用ztree树结构)*****************/
    // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
    var setting = {
            check: {
                enable: true,
                chkboxType: { "Y": "", "N": "" }
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view:{
                showIcon:false
            }
        };
    // zTree 的数据属性，深入使用请参考 API 文档（zTreeNode 节点数据详解）
    var zNodes =[
        { id:1, pId:0, name:"随意勾选 1", open:true},
        { id:11, pId:1, name:"随意勾选 1-1", open:true},
        { id:111, pId:11, name:"随意勾选 1-1-1"},
        { id:112, pId:11, name:"随意勾选 1-1-2"},
        { id:12, pId:1, name:"随意勾选 1-2", open:true},
        { id:121, pId:12, name:"随意勾选 1-2-1"},
        { id:122, pId:12, name:"随意勾选 1-2-2"},
        { id:2, pId:0, name:"随意勾选 2",  open:true},
        { id:21, pId:2, name:"随意勾选 2-1"},
        { id:22, pId:2, name:"随意勾选 2-2", open:true},
        { id:221, pId:22, name:"随意勾选 2-2-1"},
        { id:222, pId:22, name:"随意勾选 2-2-2"},
        { id:23, pId:2, name:"随意勾选 2-13"}
    ];

    $('#ksName').dropdownTree({
        zNodes: zNodes,
        treeSettings:setting,
        idSaveEle:$("#ksId")
    });
    $('#ks2Name').dropdownTree({
        zNodes: zNodes,
        treeSettings:setting,
        idSaveEle:$("#ks2Id")
    });

    // 下拉多选
    $("#xlName").dropdown({
        dataUrl:"../dropdown/dropdown.json",
        valueField:"value",
        textField:"text",
        idSaveEle:$("#xlId")
    });

    // 自定义统计的添加按钮
    $("#search_filter_more_radio").gruopSelect({
        dataUrl:"../groupSelect/groupselect.json",
        singleSelect:true,
        wrapStyle:{
            top:"25px",
            left:"10px",
            width:"700px",
            height:"300px"
        },
        onClickSure: function() {
            //点击确定将弹出框选中项渲染到“筛选条件”中
            var obj = this.getSelectedItems();
            alert(obj);
        }
    });

    //自定义统计条件区域行显示、列显示切换
    $(document).on("click",".statistics-form .operate-wrap a.check-box",function () {
        if ($(this).hasClass("selected")){
            $(this).removeClass("selected");
        }else{
            $(this).addClass("selected")
                .siblings("a.check-box").removeClass("selected");
        }
    });

    //自定义统计条件区域删除一行
    $(document).on("click",".statistics-form .operate-wrap a.del-btn",function () {
        $(this).closest("dl.sf-cont-item").remove();
    });

    //自定义统计条件区域行合计、百分比切换
    $(document).on("click",".statistics-form .sf-btn-wrap a.check-box",function () {
        if ($(this).hasClass("selected")){
            $(this).removeClass("selected");
        }else{
            $(this).addClass("selected");
        }
    });

});