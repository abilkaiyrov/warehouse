using Microsoft.EntityFrameworkCore;
using WarehouseManager.Models;

namespace WarehouseManager.Data
{
    public class WarehouseDbContext : DbContext
    {
        public WarehouseDbContext(DbContextOptions<WarehouseDbContext> options)
            : base(options)
        {
        }

        public DbSet<Resource> Resources { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Receipt> Receipts { get; set; }
        public DbSet<ReceiptItem> ReceiptItems { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<ShipmentItem> ShipmentItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Shipment>()
                .HasIndex(s => s.Number)
                .IsUnique();

            modelBuilder.Entity<Shipment>()
                .HasOne(s => s.Client)
                .WithMany()
                .HasForeignKey(s => s.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShipmentItem>()
                .HasOne(i => i.Shipment)
                .WithMany(s => s.Items)
                .HasForeignKey(i => i.ShipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ShipmentItem>()
                .HasOne(i => i.Resource)
                .WithMany()
                .HasForeignKey(i => i.ResourceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShipmentItem>()
                .HasOne(i => i.Unit)
                .WithMany()
                .HasForeignKey(i => i.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShipmentItem>()
                .Property(i => i.Quantity)
                .HasColumnType("decimal(18,2)");
        }
    }
}
