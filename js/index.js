/**
 * Created by Administrator on 2017/10/20.
 */
$(function () {

    // 右键效果
    $("#context-menu").contextPopup({
        items: [
            {label:'加载', action:function() {
                alert("您点击了加载！");
            } },
            {label:'重命名', action:function() {
               alert("您点击了重命名！");
            } },
            {label:'固定',action:function() {
                alert("您点击了固定！");
             } },
            {label:'删除',action:function() {
                alert("您点击了删除！");
            } }
        ]
    });


    // 分组选择 》多选
    $("#gs-duoxuan").gruopSelect({
        dataUrl:"groupSelect/groupselect.json",
        wrapStyle:{
            top:"-150px",
            left:"105px",
            width:"800px",
            height:"370px"
        },
        onClickSure: function() {
            alert("你选中的是"+JSON.stringify(this.getSelectedItems()));
        }
    });

    //分组选择 》单选
    $("#gs-danxuan").gruopSelect({
        dataUrl:"groupSelect/groupselect.json",
        singleSelect:true,
        wrapStyle:{
            top:"-120px",
            left:"105px",
            width:"700px",
            height:"300px"
        },
        onClickSure: function() {
            alert("你选中的是"+JSON.stringify(this.getSelectedItems()));
        }
    });
    //分组选择 》多选（模态框）
    $("#gs-modal").gruopSelect({
        dataUrl:"groupSelect/groupselect.json",
        modalFlag:true,
        wrapStyle:{
            top:($(window).height()-400)/2,
            left:($(window).width()-800)/2,
            width:"800px",
            height:"400px"
        },
        onClickSure: function() {
            alert("你选中的是"+this.getSelectedItems());
        }
    });


    // 下拉多选
    $("#dropdownName").dropdown({
        dataUrl:"dropdown/dropdown.json",
        valueField:"value",
        textField:"text",
        idSaveEle:$("#dropdownId")
    });


    //多选下拉树(使用ztree树结构)
    $('#dropdownTreeName').dropdownTree({
        zNodesUrl: "dropdown/dropdownTree.json",
        idSaveEle:$("#dropdownTreeId")
    });

    // 多值输入
    $("#multiInput").multiInput();
});