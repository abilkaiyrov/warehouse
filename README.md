В папке ClientApp  
npm install  
npm start

В корневой папке  
dotnet ef migrations add initialcreate  
dotnet ef database update  
dotnet run  

БД пустая при запуске создается автоматически  
БД находится "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=WarehouseDb;Trusted_Connection=True;TrustServerCertificate=True;"
