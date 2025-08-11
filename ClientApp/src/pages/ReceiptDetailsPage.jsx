import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Typography, Spin, Button } from "antd";
import { getReceiptById } from "../api/api";
import dayjs from "dayjs";

const ReceiptDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReceiptById(id)
            .then((data) => {
                setReceipt(data);
            })
            .catch((error) => {
                console.error("Ошибка при получении поступления", error);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spin size="large" />;

    if (!receipt) return <p>Поступление не найдено</p>;

    return (
        <div>
            <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                Назад
            </Button>
            <Card title={`Поступление №${receipt.number}`} bordered={false}>
                <Typography.Paragraph>
                    <strong>Дата:</strong> {dayjs(receipt.date).format("DD.MM.YYYY")}
                </Typography.Paragraph>

                <Typography.Title level={5}>Позиции:</Typography.Title>
                <List
                    dataSource={receipt.items}
                    renderItem={(item) => (
                        <List.Item>
                            {item.resource?.name} — {item.quantity} {item.unit?.name}
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default ReceiptDetailsPage;
