import React from 'react';
import '../css/md.css';
import '../css/display.css';
import '../css/default.css';
import marked from 'marked';
import hljs from './highlight';
import markedExtention from './markedExtention';

const getViewPortHeight = Symbol();
const canUseTag = /<\/?style>/;
markedExtention(marked);

marked.setOptions({
    // xhtml: true,
    sanitize: true,
    sanitizer: function (tag) {
        if (!tag.match(canUseTag)) {
            return tag.replace(/<(\/?.+)>/, '&lt;$1&gt;');
        } else {
            return tag;
        }
    }
});

export default class MarkDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayContent: '',
            leftClassName: 'left',
            rightClassName: 'right',
            printBtnDisplay: 'none',
            saveBtnDisplay: 'block'
        };

        this.viewPortHeight = this[getViewPortHeight]();
        this.initPrint();
        this.initMarker();
    }

    [getViewPortHeight]() {
        if (document.compatMode == "BackCompat") {
            return document.body.clientHeight;
        } else {
            return document.documentElement.clientHeight;
        }
    }

    initMarker() {
        this.markedRenderer = new marked.Renderer();
        this.markedRenderer.code = function (code, lang) {
            return `<pre><code class="lang-${lang} hljs">${hljs.highlightAuto(code).value}</code></pre>`;
        };

        this.markedRenderer.link = function (href, title, text) {
            return `<a href="${href}" title="${title}" target="_blank" >${text}</a>`
        };
    }

    componentDidMount() {
        if (this.props.onlyRead !== true)
            this.refs.textInput.focus();

        this.setState({
            displayContent: marked(this.props.text, { renderer: this.markedRenderer })
        });
    }

    handleKeyDown(e) {
        e.persist();

        if (!this.handleCtryShortcut(e))
            return false;

        if (this.inputTimeOutId) clearTimeout(this.inputTimeOutId);
        this.inputTimeOutId = setTimeout(() => {
            this.setState({
                displayContent: marked(e.target.textContent, { renderer: this.markedRenderer })
            });
        }, 300);
    }

    handleScroll(e) {
        if (requestAnimationFrame) {
            requestAnimationFrame(() => {
                const r = this.refs;
                r.right.scrollTop = (r.left.scrollTop * (r.right.scrollHeight - this.viewPortHeight)) / (r.left.scrollHeight - this.viewPortHeight);
            });
        } else {
            const r = this.refs;
            r.right.scrollTop = (r.left.scrollTop * (r.right.scrollHeight - this.viewPortHeight)) / (r.left.scrollHeight - this.viewPortHeight);
        }

    }

    handleSave(e) {
        setTimeout(() => {
            this.props.onSave(e.target.textContent);
        }, 0);
    }

    // handle ctrl+[key] shortcuts
    handleCtryShortcut(e) {
        let proxy = func => {
            func();

            e.preventDefault();
            return false;
        };

        const keycode = String.fromCharCode(e.which || e.keyCode).toLowerCase();

        if ((e.which || e.keyCode) === 9) {
            // tab
            document.getSelection().getRangeAt(0).insertNode(new Text(' '.repeat(4)));
            this.collapseRange();
            e.preventDefault();

            // may cause some error
            return true;
        }

        if (!e.ctrlKey) return true;
        switch (keycode) {
            case 's':
                return proxy(() => {
                    setTimeout(() => {
                        this.props.onSave(e.target.textContent);
                    }, 0);
                });
            // case 'v':
            //     return proxy(() => {
            //         console.log('you call me?');
            //     });

            default: return true;
        }
    }

    // when user click full button, call this method
    fullScreen(e) {
        if (this.state.leftClassName === 'left full') {
            e.target.textContent = '预览';
            this.setState({
                leftClassName: 'left',
                rightClassName: 'right',
                printBtnDisplay: 'none',
                saveBtnDisplay: 'block'
            });
        } else {
            this.setState({
                leftClassName: 'left full',
                rightClassName: 'right full',
                printBtnDisplay: 'block',
                saveBtnDisplay:'none'
            });
            e.target.textContent = '编辑';
        }
    }

    // add print event to window.event
    initPrint() {

        const self = this;

        if (window.matchMedia) {
            window.matchMedia('print').addListener(function (mql) {
                if (mql.matches) {
                    self.beforePrint();
                } else {
                    self.afterPrint();
                }
            });
        } else {
            window.beforePrint = self.beforePrint();
            window.afterPrint = self.afterPrint();
        }
    }

    beforePrint() {
        if (this.props.onlyRead !== true) {

            // if set this by setState,
            // UI will delay
            this.refs.preview.style.display = 'none';
            this.refs.save.style.display = 'none';
            if (!this.refs.left.classList.contains('full')) {
                this.refs.left.viewMode = false;
                this.refs.left.classList.add('full');
                this.refs.right.classList.add('full');

            } else {
                this.refs.left.viewMode = true;
            }
        }
        this.refs.print.style.display = 'none';
    }

    afterPrint() {
        if (this.props.onlyRead !== true) {
            this.refs.preview.style.display = 'block';
            this.refs.save.style.display = 'block';

            if (!this.refs.left.viewMode) {
                this.refs.left.classList.remove('full');
                this.refs.right.classList.remove('full');
            }

        } else {
            this.refs.print.style.display = 'block';
        }
    }

    print(e) {
        window.print();
    }

    collapseRange() {
        // collapse range
        document.getSelection().collapse(
            document.getSelection().focusNode,
            document.getSelection().focusOffset
        );
    }

    imgPaste(e) {

        if (!e.clipboardData.items || !e.clipboardData.items[0]) return true;

        // get first clipboard data
        const data = e.clipboardData.items;
        if (data[0].kind === 'string' && data[0].type === 'text/plain') {
            e.preventDefault();

            data[0].getAsString(str => {
                const matchObj = str.match(/^https?:\/\/.+\.(jpg|gif|png|jpeg|svg|bmp|apng)$/i);

                // copy img flag
                const text = matchObj ? `![](${matchObj[0]})` : str;

                // insert
                let range = document.getSelection().getRangeAt(0);
                range.deleteContents();
                range.insertNode(new Text(text));
                range.detach();
                range = null;

                // collapse range
                this.collapseRange();
            });
        } else if ([0, 1].some(o => data[o].kind === 'file' && data[o].type.startsWith('image'))) {
            const target = e.target;

            const loadStr = '![uploading you pic...]()';
            const loadTextNode = new Text(loadStr);
            let range = document.getSelection().getRangeAt(0);

            // clear select
            range.deleteContents();

            range.insertNode(loadTextNode);
            this.collapseRange();

            let xhr = new XMLHttpRequest();
            xhr.open('post', '/api/uploadPic');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {

                    const imageUrl = `![](${xhr.responseText})`;
                    range.insertNode(new Text(imageUrl));

                    range.setStart(loadTextNode, 0);
                    range.setEnd(loadTextNode, loadStr.length);

                    range.deleteContents();
                    range.detach();
                    range = null;

                    this.collapseRange();

                    // render display content
                    this.setState({
                        displayContent: marked(target.textContent, { renderer: this.markedRenderer })
                    });
                }
            }

            xhr.send((data[0].kind === 'file' ? data[0] : data[1]).getAsFile());
        }
    }

    // user click save button
    save(e){
        const text = e.target.textContent;
        setTimeout(() => {
            this.props.onSave(text);
        }, 0);
    }

    render() {
        if (this.props.onlyRead === true) {
            return (
                <div className="main">
                    <div
                        ref="right"
                        className={this.state.rightClassName + ' full'}>
                        <div
                            ref="print"
                            className="print onlyRead"
                            onClick={this.print.bind(this)}
                        >打印</div>
                        <div dangerouslySetInnerHTML={{ __html: this.state.displayContent }}></div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="main">
                    <div
                        ref="left"
                        className={this.state.leftClassName}
                        onKeyDown={this.handleKeyDown.bind(this)}
                        onScroll={this.handleScroll.bind(this)}>
                        <div
                            ref="save"
                            className="save"
                            style={{ display: this.state.saveBtnDisplay }}
                            onClick={this.save.bind(this)}
                        >保存</div>
                        <div
                            ref="preview"
                            className="full-srceen"
                            onClick={this.fullScreen.bind(this)}
                        >预览</div>
                        <pre
                            ref="textInput"
                            contentEditable="plaintext-only"
                            onPaste={this.imgPaste.bind(this)}
                        >{this.props.text}</pre>
                    </div>
                    <div
                        ref="right"
                        className={this.state.rightClassName}>
                        <div
                            ref="print"
                            className="print"
                            style={{ display: this.state.printBtnDisplay }}
                            onClick={this.print.bind(this)}
                        >打印</div>
                        <div dangerouslySetInnerHTML={{ __html: this.state.displayContent }}></div>
                    </div>
                </div>
            );
        }
    }
}