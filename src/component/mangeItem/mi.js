import React from 'react';
import './mi.css';

export default class MangeItem extends React.Component {

    constructor(props) {
        super(props);
    }

    checkChange(e) {
        const cn = e.target.parentNode.className;
        const filename = e.target.parentNode.parentNode.textContent;
        this.props.change(cn.substring(1), filename);
    }

    render() {
        return (
            <div className="list">
                <div className="item item-title">
                    <div className="name name-title">文件名称</div>
                    <div className="cread">可读</div>
                    <div className="cwrite">可写</div>
                </div>
                {this.props.data.map(item => {
                    return (
                        <div key={item.name} className="item">
                            <div className="name">{item.name}</div>
                            <div className="cread"><input type="checkbox" onChange={this.checkChange.bind(this)} defaultChecked={item.canRead} /></div>
                            <div className="cwrite"><input type="checkbox" onChange={this.checkChange.bind(this)} defaultChecked={item.canWrite} /></div>
                        </div>);
                })}
            </div>
        );
    }

}