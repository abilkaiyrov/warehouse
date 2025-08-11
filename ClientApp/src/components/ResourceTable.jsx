import React from "react";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";

const ResourceTable = ({ data, isArchived = false }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: "Наименование",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <a onClick={() => navigate(`/resources/${record.id}`)}>{text}</a>
            ),
        },
    ];

    return <Table rowKey="id" dataSource={Array.isArray(data) ? data : []} columns={columns} />;
};

export default ResourceTable;
