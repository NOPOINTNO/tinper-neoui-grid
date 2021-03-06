/*
 * 设置某列是否显示(传入column)
 */
var setColumnVisibleByColumn = function setColumnVisibleByColumn(column, visible) {
    var index = this.getIndexOfColumn(column);
    this.setColumnVisibleByIndex(index, visible);
};
/*
 * 设置某列是否显示(传入index为gridCompColumnArr中的数据)
 */
var setColumnVisibleByIndex = function setColumnVisibleByIndex(index, visible) {
    if (index >= 0) {
        var column = this.gridCompColumnArr[index],
            visibleIndex = this.getVisibleIndexOfColumn(column),
            canVisible = column.options.canVisible,
            l = $('input:checked', $('#' + this.options.id + '_column_menu_columns_ul')).length;
        if (!canVisible && visible == false) {
            return;
        }
        // 显示处理
        if (column.options.visible == false && visible) {
            var htmlStr = '<col';
            if (column.options.width) {
                htmlStr += ' style="width:' + this.formatWidth(column.options.width) + '"';
            }
            htmlStr += '>';
            // 当前列之后的显示列的index
            var nextVisibleIndex = this.getNextVisibleInidexOfColumn(column);
            $('#' + this.options.id + '_header_table th:eq(' + index + ')').css('display', "");
            $('#' + this.options.id + '_content_table th:eq(' + index + ')').css('display', "");
            $('td:eq(' + index + ')', $('#' + this.options.id + '_content tbody tr')).css('display', "");
            if (nextVisibleIndex < 0) {
                this.lastVisibleColumn = column;
                // 添加在最后面
                try {
                    $('#' + this.options.id + '_header_table col:last')[0].insertAdjacentHTML('afterEnd', htmlStr);
                    $('#' + this.options.id + '_content_table col:last')[0].insertAdjacentHTML('afterEnd', htmlStr);
                } catch (e) {
                    $('#' + this.options.id + '_header_table col:last').after(htmlStr);
                    $('#' + this.options.id + '_content_table col:last').after(htmlStr);
                }
            } else {
                // 添加在下一个显示列之前
                try {
                    $('#' + this.options.id + '_header_table col:eq(' + (nextVisibleIndex - 1) + ')')[0].insertAdjacentHTML('beforeBegin', htmlStr);
                    $('#' + this.options.id + '_content_table col:eq(' + (nextVisibleIndex - 1) + ')')[0].insertAdjacentHTML('beforeBegin', htmlStr);
                } catch (e) {
                    $('#' + this.options.id + '_header_table col:eq(' + (nextVisibleIndex - 1) + ')').before(htmlStr);
                    $('#' + this.options.id + '_content_table col:eq(' + (nextVisibleIndex - 1) + ')').before(htmlStr);
                }
            }
            var newContentW = this.contentWidth + parseInt(column.options.width);
            if (this.showType == 'grid') {
                $('#' + this.options.id + '_column_menu_columns_ul li input:eq(' + index + ')')[0].checked = true;
            }
        }
        // 隐藏处理
        if (column.options.visible == true && !visible) {
            $('#' + this.options.id + '_header_table th:eq(' + index + ')').css('display', "none");
            $('#' + this.options.id + '_header_table col:eq(' + visibleIndex + ')').remove();
            $('#' + this.options.id + '_content_table th:eq(' + index + ')').css('display', "none");
            $('#' + this.options.id + '_content_table col:eq(' + visibleIndex + ')').remove();
            $('td:eq(' + index + ')', $('#' + this.options.id + '_content_table tbody tr')).css('display', "none");
            // 隐藏之后需要判断总体宽度是否小于内容区最小宽度，如果小于需要将最后一列进行扩展
            var newContentW = this.contentWidth - parseInt(column.options.width);
            if (this.showType == 'grid') {
                $('#' + this.options.id + '_column_menu_columns_ul li input:eq(' + index + ')')[0].checked = false;
            }
            if (this.lastVisibleColumn == column) {
                var allVisibleColumns = this.getAllVisibleColumns();
                this.lastVisibleColumn = allVisibleColumns[allVisibleColumns.length - 1];
            }
        }
        column.options.visible = visible;
        var w = this.contentWidthChange(newContentW);
        this.lastVisibleColumn.options.width = this.lastVisibleColumnWidth;
        this.contentWidth = w;
        this.resetThVariable();
        this.noScrollWidthReset();
        this.contentMinWidth = parseInt(this.wholeWidth) - parseInt(this.leftW) - parseInt(this.fixedWidth);
        if (this.contentMinWidth < 0) this.contentMinWidth = 0;
        if (this.contentRealWidth < this.contentMinWidth) {
            this.contentWidth = this.contentMinWidth;
            var oldWidth = this.lastVisibleColumn.options.width;
            this.lastVisibleColumnWidth = oldWidth + (this.contentMinWidth - this.contentRealWidth);
            // modfied by tianxq1 最后一列自动扩展
            this.lastVisibleColumn.options.width = this.lastVisibleColumnWidth;
            // this.setColumnWidth(this.lastVisibleColumn, this.lastVisibleColumnWidth);
        } else {
            this.contentWidth = this.contentRealWidth;
        }
        this.resetColumnWidthByRealWidth();
        this.saveGridCompColumnArrToLocal();

        var columnAllCheck = $('input', $('#' + this.options.id + '_column_menu_ul .header'));
        if (columnAllCheck.length > 0) {
            var lll = $('input:not(:checked)', $('#' + this.options.id + '_column_menu_columns_ul')).length;
            if (lll > 0) {
                columnAllCheck[0].checked = false;
            } else {
                columnAllCheck[0].checked = true;
            }
        }
    }
};

var resetColumnWidthByRealWidth = function resetColumnWidthByRealWidth() {
    var oThis = this;
    $.each(this.gridCompColumnArr, function () {
        if (this.options.realWidth != this.options.width) {
            oThis.setColumnWidth(this, this.options.realWidth);
        }
    });
    this.resetLastVisibleColumnWidth();
};

/*
 * 根据field设置宽度
 */
var setCoulmnWidthByField = function setCoulmnWidthByField(field, newWidth) {
    var column = this.getColumnByField(field);
    this.setColumnWidth(column, newWidth);
};
/*
 * 根据column对象设置宽度
 */
var setColumnWidth = function setColumnWidth(column, newWidth) {
    // if (column != this.lastVisibleColumn) {
    if (newWidth > this.minColumnWidth || newWidth == this.minColumnWidth) {
        var nowVisibleThIndex = this.getVisibleIndexOfColumn(column),
            oldWidth = column.options.width,
            changeWidth = newWidth - oldWidth,
            cWidth = this.contentWidth + changeWidth;
        this.contentWidth = this.contentWidthChange(cWidth);
        $('#' + this.options.id + '_header_table col:eq(' + nowVisibleThIndex + ')').css('width', newWidth + "px");
        $('#' + this.options.id + '_content_table col:eq(' + nowVisibleThIndex + ')').css('width', newWidth + "px");
        column.options.width = newWidth;
        column.options.realWidth = newWidth;
        this.resetThVariable();
        this.saveGridCompColumnArrToLocal();
    }
    this.resetLastVisibleColumnWidth();
    this.columnsVisibleFun();
    // }
};
/*
 * 设置数据源
 */
var setDataSource = function setDataSource(dataSource) {
    if (!(this.$ele.data('gridComp') == this)) return;
    this.initDataSourceVariable();
    this.options.dataSource = dataSource;
    this.initDataSource();
    if (this.showType == 'grid') {
        this.widthChangeGridFun();
        if (this.dataSourceObj.rows.length > 0) {
            $('#' + this.options.id + '_grid .u-grid-noScroll-left').css('display', "block");
        } else {
            $('#' + this.options.id + '_grid .u-grid-noScroll-left').css('display', "none");
        }
    }
};
/*
 * 设置数据源 格式为：
 * {
    fields:['column1','column2','column3','column4','column5','column6'],
    values:[["cl1","1","cl3","cl4","cl5","cl6"]
            ,["cl12","2","cl32","cl42","cl52","cl62"]
            ,["cl13","3","cl33","cl43","cl53","cl63"]
            ,["cl14","4","cl34","cl44","cl54","cl64"]
            ,["cl15","5","cl35","cl45","cl55","cl65"]
            ,["cl16","6","cl36","cl46","cl56","cl66"]
        ]

    }
 */
var setDataSourceFun1 = function setDataSourceFun1(dataSource) {
    var dataSourceObj = {};
    if (dataSource.values) {
        var valuesArr = new Array();
        $.each(dataSource.values, function () {
            if (dataSource.fields) {
                var valueObj = {},
                    value = this;
                $.each(dataSource.fields, function (j) {
                    $(valueObj).attr(this, value[j]);
                });
                valuesArr.push(valueObj);
            }
        });
    }
    $(dataSourceObj).attr('values', valuesArr);
    this.setDataSource(dataSourceObj);
};
export var setFunObj = {
    setColumnVisibleByColumn: setColumnVisibleByColumn,
    setColumnVisibleByIndex: setColumnVisibleByIndex,
    setCoulmnWidthByField: setCoulmnWidthByField,
    setColumnWidth: setColumnWidth,
    setDataSource: setDataSource,
    setDataSourceFun1: setDataSourceFun1,
    resetColumnWidthByRealWidth: resetColumnWidthByRealWidth
};