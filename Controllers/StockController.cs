using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WarehouseManager.Data;
using WarehouseManager.Models;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly WarehouseDbContext _db;
    public StockController(WarehouseDbContext db) => _db = db;

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable(Guid resourceId, Guid unitId)
    {
        var received = await _db.ReceiptItems
            .Where(i => i.ResourceId == resourceId && i.UnitId == unitId)
            .SumAsync(i => (decimal?)i.Quantity) ?? 0m;

        var shipped = await _db.ShipmentItems
            .Where(i => i.ResourceId == resourceId && i.UnitId == unitId && i.Shipment.Status == ShipmentStatus.Signed)
            .SumAsync(i => (decimal?)i.Quantity) ?? 0m;

        var available = received - shipped;
        return Ok(new { resourceId, unitId, available });
    }
}