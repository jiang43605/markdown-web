module.exports = `# 一个简单的\`markdown\`编辑器

## 支持的语法

> 1.\`h1-h6\` 类标签  

- # h1
- ## h2
- ...

> 2.文字斜体以及强调  

我们来看看*斜体*是什么样  
来看看**强调**是什么样

> 3.链接

**第一种形式：** [github](https://www.github.com/)  
**第二种形式：** https://www.github.com/

> 4.行内代码格式

ES6支持了\`class\`格式，以及\`extends\`继承格式

> 5.图片  

![](http://ppt.downhot.com/d/file/p/2015/09/01/420ec9bb76da2cfcac324274b3fcbcb6.jpg)

> 6.支持行内代码块

\`\`\`java
public void Test(){
    // 打印说明文
    string text = "hello world";
    system.out.print(text);
}
\`\`\`

> 7.分隔符支持两种\`***\`和\`---\`  

---

## 网站使用方式

> 要新建一个文档是很简单的，在地址栏后新加一个section（多个section只取第一个），例如\`http://imd.azurewebsites.net/test\`,末尾的\`test\`即表示这个新文档，新文档初始会展示本篇说明，**需要注意的是，这个新文档还未保存到服务器**，要将这个文档保存下来，你需要在左边输入处按\`ctrl+s\`保存一次，下次查看再直接输入此网址即可。  

> 支持浏览器的 pdf 的打印输出，**请使用chrome浏览器**，操作步骤如下：  
   1. 点击右上角预览
   2. 点击出现的打印按钮

> 功能添加及bug修复进度页面：http://imd.azurewebsites.net/report

## 联系我  
503960146@qq.com`;