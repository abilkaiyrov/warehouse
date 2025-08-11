using System;
using System.Collections.Generic;

namespace WarehouseManager.Models
{
    public class Balance
    {
        public Guid Id { get; set; }

        public Guid UnitId { get; set; }
        public Unit Unit { get; set; }
    }
}