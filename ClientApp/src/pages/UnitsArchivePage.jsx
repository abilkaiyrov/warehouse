import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { getArchivedUnits } from "../api/api";
import { useNavigate } from "react-router-dom";

const UnitsArchivePage = () => {
    const [units, setUnits] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getArchivedUnits()
            .then(setUnits)
            .catch(console.error);
    }, []);

    const columns = [
        {
            title: "Наименование",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <a onClick={() => navigate(`/units/${record.id}`)}>{text}</a>
            ),
        },
    ];

    return (
        <div>
            <h1>Архив единиц измерения</h1>
            <Button onClick={() => navigate("/units/1")}>К рабочим</Button>
            <Table rowKey="id" dataSource={units} columns={columns} />
        </div>
    );
};

export default UnitsArchivePage;
