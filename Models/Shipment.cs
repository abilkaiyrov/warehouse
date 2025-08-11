using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WarehouseManager.Models
{
    public class Shipment
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(50)]
        public string Number { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        [Required]
        public Guid ClientId { get; set; }
        public Client Client { get; set; }

        [Required]
        public ShipmentStatus Status { get; set; } = ShipmentStatus.Unsigned;

        public ICollection<ShipmentItem> Items { get; set; } = new List<ShipmentItem>();
    }
}
