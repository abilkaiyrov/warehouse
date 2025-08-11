using System;

namespace WarehouseManager.Models.Dto
{
    public class BalanceDto
    {
        public Guid ResourceId { get; set; }
        public Guid UnitId { get; set; }
        public string Resource { get; set; }
        public string Unit { get; set; }
        public decimal Quantity { get; set; }
    }
}