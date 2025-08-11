using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WarehouseManager.Models
{
    public class ReceiptItem
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ReceiptId { get; set; }

        [Required]
        public Guid ResourceId { get; set; }

        [Required]
        public Guid UnitId { get; set; }

        [Range(0.001, 1000000)]
        public decimal Quantity { get; set; }

        [ForeignKey("ReceiptId")]
        public Receipt Receipt { get; set; }

        [ForeignKey("ResourceId")]
        public Resource Resource { get; set; }

        [ForeignKey("UnitId")]
        public Unit Unit { get; set; }
    }
}
