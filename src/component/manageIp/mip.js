import React from 'react';
import './mip.css';

export default class MangeItem extends React.Component {

    constructor(props) {
        super(props);
    }

    checkChange(e) {
        e.persist()
        if (this.timerId) clearTimeout(this.timerId);

        this.timerId = setTimeout(() => {
            const infoNode = e.target.parentNode.parentNode.children;
            const name = infoNode[0].textContent;
            const value = e.target.value;
            this.props.change(name, value);
        }, 1000);
    }

    render() {
        return (
            <div className="list">
                <div className="item item-title">
                    <div className="name name-title">ip地址</div>
                    <div className="cread">目前文件数</div>
                    <div className="cwrite">设置可创建最大文件数</div>
                </div>
                {this.props.data.map(item => {
                    return (
                        <div key={item.name} className="item">
                            <div className="name">{item.name}</div>
                            <div className="cread">{item.count}</div>
                            <div className="cwrite"><input type="text" onChange={this.checkChange.bind(this)} defaultValue={item.maxCount} /></div>
                        </div>);
                })}
            </div>
        );
    }

}