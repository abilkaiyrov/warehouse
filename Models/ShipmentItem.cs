using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseManager.Models
{
    public class ShipmentItem
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ShipmentId { get; set; }
        public Shipment Shipment { get; set; }

        [Required]
        public Guid ResourceId { get; set; }
        public Resource Resource { get; set; }

        [Required]
        public Guid UnitId { get; set; }
        public Unit Unit { get; set; }

        // Количество к отгрузке
        [Range(0.001, 1_000_000)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }
    }
}
