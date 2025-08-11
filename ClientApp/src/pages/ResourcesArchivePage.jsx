import React, { useEffect, useState } from "react";
import { Button, Table, message } from "antd";
import { useNavigate } from "react-router-dom";
import { getArchivedResources } from "../api/api";

const ResourcesArchivePage = () => {
    const [resources, setResources] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getArchivedResources()
            .then(setResources)
            .catch((error) => {
                console.error(error);
                message.error("Не удалось загрузить архив");
            });
    }, []);

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

    return (
        <div>
            <h1>Архив ресурсов</h1>
            <Button type="default" onClick={() => navigate("/resources/1")}>
                Назад к активным
            </Button>
            <Table columns={columns} dataSource={resources} rowKey="id" />
        </div>
    );
};

export default ResourcesArchivePage;
