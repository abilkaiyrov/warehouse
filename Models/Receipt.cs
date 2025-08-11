using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WarehouseManager.Models
{
    public class Receipt
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Number { get; set; }

        public DateTime Date { get; set; }

        public ICollection<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
    }
}
