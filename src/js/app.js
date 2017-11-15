import React from 'react';
import MarkDown from '../component/markdown/js/md';
import SaveInfo from '../component/saveinfo/saveinfo';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity: 0,
            info: "保存中..."
        }
    }

    save(text) {
        this.setState({ opacity: 1, info: "保存中..." });
        const self = this;

        let xhr = new XMLHttpRequest();
        xhr.open('post', '/api/save');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                setTimeout(() => {
                    self.setState({ opacity: 0, info: '保存成功' });
                }, 1000);
            } else {
                setTimeout(() => {
                    self.setState({
                        opacity: 0,
                        info: xhr.responseText ? xhr.responseText : '保存失败'
                    });
                }, 1000);
            }
        }
        xhr.send(JSON.stringify({
            file: location.pathname.substring(1),
            text: encodeURIComponent(text)
        }));
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <MarkDown
                    onSave={this.save.bind(this)}
                    text={this.props.text !== '@text' ? this.props.text : require('./mainPageInfo')} onlyRead={this.props.onlyRead} />
                <SaveInfo
                    opacity={this.state.opacity}
                    info={this.state.info} />
            </div>
        );
    }
}