import React from 'react';
import '../css/md.css';
import '../css/display.css';
import '../css/default.css';
import marked from 'marked';
import hljs from './highlight';

const getViewPortHeight = Symbol();

export default class MarkDown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayContent: '',
            leftClassName: 'left',
            rightClassName: 'right',
            printBtnDisplay: 'none'
        };

        this.viewPortHeight = this[getViewPortHeight]();
        this.initPrint();
    }

    [getViewPortHeight]() {
        if (document.compatMode == "BackCompat") {
            return document.body.clientHeight;
        } else {
            return document.documentElement.clientHeight;
        }
    }

    componentDidMount() {
        if (this.props.onlyRead !== true)
            this.refs.textInput.focus();

        this.markedRenderer = new marked.Renderer();
        this.markedRenderer.code = function (code, lang) {
            return `<pre><code class="lang-${lang} hljs">${hljs.highlightAuto(code).value}</code></pre>`;
        };

        this.markedRenderer.link = function (href, title, text) {
            return `<a href="${href}" title="${title}" target="_blank" >${text}</a>`
        };

        this.refs.displayContent.innerHTML = marked(this.props.text, { renderer: this.markedRenderer });
    }

    handleKeyDown(e) {
        e.persist();

        if (!this.handleSave(e))
            return false;

        if (this.inputTimeOutId) clearTimeout(this.inputTimeOutId);
        this.inputTimeOutId = setTimeout(() => {
            this.refs.displayContent.innerHTML = marked(e.target.textContent, { renderer: this.markedRenderer });
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

        const key = e.which || e.keyCode;
        if ((String.fromCharCode(key).toLowerCase() === 's') && e.ctrlKey) {
            setTimeout(() => {
                this.props.onSave(e.target.textContent);
            }, 0);
            e.preventDefault();
            return false;
        } else return true;
    }

    handlePrint(e) {
        console.log('you call me?')
        const key = e.which || e.keyCode;
        if (String.fromCharCode(key).toLowerCase === 'p' && e.ctrlKey) {
            this.refs.preview.style.display = 'none';
        }
    }

    // when user click full button, call this method
    fullScreen(e) {
        if (this.state.leftClassName === 'left full') {
            e.target.textContent = '预览';
            this.setState({
                leftClassName: 'left',
                rightClassName: 'right',
                printBtnDisplay: 'none'
            });
        } else {
            this.setState({
                leftClassName: 'left full',
                rightClassName: 'right full',
                printBtnDisplay: 'block'
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
        if (this.props.onlyRead !== true)
            this.refs.preview.style.display = 'none';
        this.refs.print.style.display = 'none';
    }

    afterPrint() {
        if (this.props.onlyRead !== true)
            this.refs.preview.style.display = 'block';
        this.refs.print.style.display = 'block';
    }

    print(e) {
        window.print();
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
                        <div ref="displayContent"></div>
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
                            ref="preview"
                            className="full-srceen"
                            onClick={this.fullScreen.bind(this)}
                        >预览</div>
                        <pre
                            ref="textInput"
                            contentEditable="plaintext-only">{this.props.text}</pre>
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
                        <div ref="displayContent"></div>
                    </div>
                </div>
            );
        }
    }
}