import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Input, message } from "antd";
import api from "../utils/api";

const ResourceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const isNew = id === "00000000-0000-0000-0000-000000000000";

  useEffect(() => {
    if (!isNew) {
      api.get(`/resources/${id}`).then((res) => {
        form.setFieldsValue(res.data);
      });
    }
  }, [id, isNew, form]);

  const handleSave = async () => {
    const values = form.getFieldsValue();
    try {
      if (isNew) {
        await api.post("/resources", values);
      } else {
        await api.put(`/resources/${id}`, values);
      }
      message.success("Сохранено");
      navigate("/resources/1");
    } catch {
      message.error("Ошибка при сохранении");
    }
  };

  const handleDelete = async () => {
    await api.delete(`/resources/${id}`);
    message.success("Удалено");
    navigate("/resources/1");
  };

  const handleArchive = async () => {
    await api.post(`/resources/${id}/archive`);
    message.success("В архиве");
    navigate("/resources/2");
  };

  return (
    <div>
      <h2>Ресурс</h2>
      <Form layout="vertical" form={form}>
        <Form.Item label="Наименование" name="name">
          <Input />
        </Form.Item>
        <Button type="primary" onClick={handleSave}>
          Сохранить
        </Button>
        {!isNew && (
          <>
            <Button danger onClick={handleDelete} style={{ marginLeft: 8 }}>
              Удалить
            </Button>
            <Button
              style={{ background: "#fadb14", marginLeft: 8 }}
              onClick={handleArchive}
            >
              В архив
            </Button>
          </>
        )}
      </Form>
    </div>
  );
};

export default ResourceForm;