import ManageItem from '../component/mangeItem/mi';
import ManageIp from '../component/manageIp/mip';
import React from 'react';
import ReactDOM from 'react-dom';
import '../css/manage.css';

let change = function (cn, filename) {
    document.getElementById('info').textContent = '正在保存...';
    document.getElementById('info').style.opacity = 1;

    let xhr = new XMLHttpRequest();
    xhr.open('post', '/api/c');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('info').textContent = '保存成功';
            setTimeout(() => {
                document.getElementById('info').style.opacity = 0;
            }, 1000);
        } else {
            document.getElementById('info').textContent = '保存失败';
            setTimeout(() => {
                document.getElementById('info').style.opacity = 0;
                location.reload();
            }, 1000);
        }
    }
    xhr.send(JSON.stringify({ flag: cn, filename: encodeURIComponent(filename) }));
};

let ipChange = function (name, value) {
    document.getElementById('info').textContent = '正在保存...';
    document.getElementById('info').style.opacity = 1;

    let xhr = new XMLHttpRequest();
    xhr.open('post', '/api/ip');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('info').textContent = '保存成功';
            setTimeout(() => {
                document.getElementById('info').style.opacity = 0;
            }, 1000);
        } 
    }
    xhr.send(JSON.stringify({ name: name, value: encodeURIComponent(value) }));
}

ReactDOM.render(
    <div>
        <ManageItem data={data} change={change} />
        <ManageIp data={ipdata} change={ipChange} />
    </div>,
    document.getElementById('root')
);
