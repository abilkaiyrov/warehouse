import { Table } from "antd";
import { useNavigate } from "react-router-dom";

const ReceiptsTable = ({ data }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: "Номер",
            dataIndex: "number",
            key: "number",
        },
        {
            title: "Дата",
            dataIndex: "date",
            key: "date",
            render: (text) => new Date(text).toLocaleDateString("ru-RU"),
        },
        {
            title: "Количество позиций",
            dataIndex: "items",
            key: "items",
            render: (items) => items.length,
        },
    ];

    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            onRow={(record) => {
                return {
                    onClick: () => navigate(`/receipts/${record.id}`),
                    style: { cursor: "pointer" },
                };
            }}
        />
    );
};

export default ReceiptsTable;
