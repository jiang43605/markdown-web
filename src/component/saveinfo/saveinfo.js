import React from 'react';
import './saveinfo.css';

export default class SaveInfo extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container" style={{ opacity: this.props.opacity }}>
                <div className="slider"></div>
                <span className="info">{this.props.info ? this.props.info : 'null'}</span>
            </div>
        );
    }

}