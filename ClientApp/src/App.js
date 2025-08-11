import React from "react";
import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    DatabaseOutlined,
    ReconciliationOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    SettingOutlined,
    TagsOutlined,
} from "@ant-design/icons";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";

import BalancesPage from "./pages/BalancesPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import ReceiptFormPage from "./pages/ReceiptFormPage";
import ReceiptDetailsPage from "./pages/ReceiptDetailsPage";
import ShipmentsPage from "./pages/ShipmentsPage";
import ShipmentFormPage from "./pages/ShipmentFormPage";

import ClientsPage from "./pages/ClientsPage";
import ClientFormPage from "./pages/ClientFormPage";

import UnitsPage from "./pages/UnitsPage";
import UnitFormPage from "./pages/UnitFormPage";

import ResourcesPage from "./pages/ResourcesPage";
import ResourceFormPage from "./pages/ResourceFormPage";

const { Header, Sider, Content } = Layout;

function Shell() {
    const nav = useNavigate();
    const { pathname } = useLocation();

    const selectedKey =
        pathname.startsWith("/balances") ? "balances" :
            pathname.startsWith("/receipts") ? "receipts" :
                pathname.startsWith("/shipments") ? "shipments" :
                    pathname.startsWith("/clients") ? "clients" :
                        pathname.startsWith("/units") ? "units" :
                            pathname.startsWith("/resources") ? "resources" :
                                "";

    const items = [
        {
            key: "group-warehouse",
            label: "Склад",
            type: "group",
            children: [
                { key: "balances", icon: <DatabaseOutlined />, label: "Баланс", onClick: () => nav("/balances") },
                { key: "receipts", icon: <ReconciliationOutlined />, label: "Поступления", onClick: () => nav("/receipts/1") },
                { key: "shipments", icon: <ShoppingCartOutlined />, label: "Отгрузки", onClick: () => nav("/shipments") },
            ],
        },
        {
            key: "group-dicts",
            label: "Справочники",
            type: "group",
            children: [
                { key: "clients", icon: <TeamOutlined />, label: "Клиенты", onClick: () => nav("/clients/1") },
                { key: "units", icon: <SettingOutlined />, label: "Единицы измерения", onClick: () => nav("/units/1") },
                { key: "resources", icon: <TagsOutlined />, label: "Ресурсы", onClick: () => nav("/resources/1") },
            ],
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ color: "#fff", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <AppstoreOutlined />
                <span>Управление складом</span>
            </Header>

            <Layout>
                <Sider breakpoint="lg" collapsedWidth="0" width={260} style={{ background: "#fff" }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={items}
                        style={{ height: "100%", borderRight: 0, padding: 8 }}
                    />
                </Sider>

                <Layout style={{ padding: 16 }}>
                    <Content style={{ background: "#fff", padding: 16, borderRadius: 8, minHeight: 360 }}>
                        <Routes>

                            <Route path="/balances" element={<BalancesPage />} />

                            <Route path="/receipts/1" element={<ReceiptsPage />} />
                            <Route path="/receipts/:id" element={<ReceiptDetailsPage />} />
                            <Route path="/receipts/form/:id" element={<ReceiptFormPage />} />

                            <Route path="/shipments" element={<ShipmentsPage />} />
                            <Route path="/shipments/form/:id" element={<ShipmentFormPage />} />

                            <Route path="/clients/1" element={<ClientsPage />} />
                            <Route path="/clients/2" element={<ClientsPage />} />
                            <Route path="/clients/:id" element={<ClientFormPage />} />
                            <Route path="/clients/form/:id" element={<ClientFormPage />} />

                            <Route path="/units/1" element={<UnitsPage />} />
                            <Route path="/units/2" element={<UnitsPage />} />
                            <Route path="/units/:id" element={<UnitFormPage />} />
                            <Route path="/units/form/:id" element={<UnitFormPage />} />

                            <Route path="/resources/1" element={<ResourcesPage />} />
                            <Route path="/resources/2" element={<ResourcesPage />} />
                            <Route path="/resources/:id" element={<ResourceFormPage />} />
                            <Route path="/resources/form/:id" element={<ResourceFormPage />} />

                            <Route path="*" element={<Navigate to="/balances" replace />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Shell />
        </BrowserRouter>
    );
}
