import React, { useEffect, useState } from "react";
import { Button, Form, Input, Space, message, Popconfirm } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    archiveUnit,
    unarchiveUnit,
} from "../api/api";

const ZERO = "00000000-0000-0000-0000-000000000000";

export default function UnitFormPage() {
    const { id } = useParams();
    const isCreate = id === ZERO;
    const nav = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isArchived, setIsArchived] = useState(false);

    useEffect(() => {
        if (isCreate) {
            form.setFieldsValue({ name: "" });
            setIsArchived(false);
            return;
        }
        (async () => {
            try {
                const u = await getUnitById(id);
                form.setFieldsValue({ name: u.name });
                setIsArchived(!!u.isArchived);
            } catch (e) {
                console.error(e);
                message.error("Не удалось загрузить единицу");
            }
        })();
    }, [id]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const { name } = await form.validateFields();
            if (isCreate) {
                await createUnit({ name });
                message.success("Единица создана");
                nav("/units/1");
            } else {
                await updateUnit(id, { name });
                message.success("Изменения сохранены");
                const u = await getUnitById(id);
                setIsArchived(!!u.isArchived);
            }
        } catch (e) {
            if (!e?.errorFields) {
                console.error(e);
                message.error(e.message || "Ошибка сохранения");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteUnit(id);
            message.success("Единица удалена");
            nav(isArchived ? "/units/2" : "/units/1");
        } catch (e) {
            console.error(e);
            message.error("Ошибка удаления");
        }
    };

    const handleArchiveToggle = async () => {
        try {
            if (isArchived) {
                await unarchiveUnit(id);
                message.success("Перенесена в работу");
                setIsArchived(false);
                nav("/units/1");
            } else {
                await archiveUnit(id);
                message.success("Перенесена в архив");
                setIsArchived(true);
                nav("/units/2");
            }
        } catch (e) {
            console.error(e);
            message.error("Операция не выполнена");
        }
    };

    return (
        <div>
            <h1>{isCreate ? "Создать единицу" : "Редактировать единицу"}</h1>

            <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
                <Form.Item
                    label="Наименование"
                    name="name"
                    rules={[{ required: true, message: "Введите наименование" }]}
                >
                    <Input placeholder="Например: кг, шт, м" />
                </Form.Item>
            </Form>

            <Space>
                <Button type="primary" loading={loading} onClick={handleSave}>
                    Сохранить
                </Button>

                {!isCreate && (
                    <>
                        <Popconfirm
                            title="Удалить единицу?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={handleDelete}
                        >
                            <Button danger>Удалить</Button>
                        </Popconfirm>

                        <Button onClick={handleArchiveToggle}>
                            {isArchived ? "В работу" : "В архив"}
                        </Button>
                    </>
                )}
            </Space>
        </div>
    );
}
