import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create Departments
  const engDept = await prisma.department.create({ data: { name: 'Engineering' } });
  const mktDept = await prisma.department.create({ data: { name: 'Marketing' } });
  const opsDept = await prisma.department.create({ data: { name: 'Operations' } });

  const password = await bcrypt.hash('password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: { name: 'John Admin', email: 'admin@company.com', password, role: 'ADMIN' }
  });

  const assetManager = await prisma.user.create({
    data: { name: 'Sarah Manager', email: 'manager@company.com', password, role: 'ASSET_MANAGER' }
  });

  const engHead = await prisma.user.create({
    data: { name: 'Alice Engineering', email: 'alice@company.com', password, role: 'DEPT_HEAD', departmentId: engDept.id }
  });
  await prisma.department.update({ where: { id: engDept.id }, data: { headId: engHead.id } });

  const mktHead = await prisma.user.create({
    data: { name: 'Bob Marketing', email: 'bob@company.com', password, role: 'DEPT_HEAD', departmentId: mktDept.id }
  });
  await prisma.department.update({ where: { id: mktDept.id }, data: { headId: mktHead.id } });

  const emp1 = await prisma.user.create({
    data: { name: 'Mike Employee', email: 'mike@company.com', password, role: 'EMPLOYEE', departmentId: engDept.id }
  });

  const emp2 = await prisma.user.create({
    data: { name: 'Emma Employee', email: 'emma@company.com', password, role: 'EMPLOYEE', departmentId: engDept.id }
  });

  const emp3 = await prisma.user.create({
    data: { name: 'Liam Employee', email: 'liam@company.com', password, role: 'EMPLOYEE', departmentId: mktDept.id }
  });

  const emp4 = await prisma.user.create({
    data: { name: 'Noah Employee', email: 'noah@company.com', password, role: 'EMPLOYEE', departmentId: opsDept.id }
  });

  // Create Assets
  const assets = [
    { name: 'MacBook Pro M3 Max', category: 'Laptop', serialNo: 'MBP-001', status: 'ALLOCATED', departmentId: engDept.id, value: 3000 },
    { name: 'MacBook Pro M3 Pro', category: 'Laptop', serialNo: 'MBP-002', status: 'ALLOCATED', departmentId: engDept.id, value: 2000 },
    { name: 'Dell XPS 15', category: 'Laptop', serialNo: 'DXPS-001', status: 'ALLOCATED', departmentId: mktDept.id, value: 1800 },
    { name: 'ThinkPad X1 Carbon', category: 'Laptop', serialNo: 'TP-001', status: 'ALLOCATED', departmentId: opsDept.id, value: 1500 },
    { name: 'Dell UltraSharp 32" 4K', category: 'Monitor', serialNo: 'DELL-M-001', status: 'AVAILABLE', departmentId: engDept.id, value: 800 },
    { name: 'Dell UltraSharp 32" 4K', category: 'Monitor', serialNo: 'DELL-M-002', status: 'UNDER_MAINTENANCE', departmentId: engDept.id, value: 800 },
    { name: 'Conference Room A Projector', category: 'Projector', serialNo: 'PROJ-001', status: 'AVAILABLE', departmentId: opsDept.id, value: 1200 },
    { name: 'Herman Miller Aeron Chair', category: 'Furniture', serialNo: 'HM-001', status: 'AVAILABLE', departmentId: engDept.id, value: 1000 },
    { name: 'Herman Miller Aeron Chair', category: 'Furniture', serialNo: 'HM-002', status: 'AVAILABLE', departmentId: mktDept.id, value: 1000 },
    { name: 'Standing Desk - Uplift V2', category: 'Furniture', serialNo: 'UP-001', status: 'AVAILABLE', departmentId: opsDept.id, value: 700 },
    { name: 'Company Van - Ford Transit', category: 'Vehicle', serialNo: 'VAN-001', status: 'AVAILABLE', departmentId: opsDept.id, value: 35000 },
    { name: 'iPad Pro 12.9"', category: 'Tablet', serialNo: 'IPAD-001', status: 'LOST', departmentId: mktDept.id, value: 1100 },
    { name: 'Sony A7IV Camera', category: 'Equipment', serialNo: 'SONY-001', status: 'AVAILABLE', departmentId: mktDept.id, value: 2500 },
    { name: 'MacBook Air M2', category: 'Laptop', serialNo: 'MBA-001', status: 'AVAILABLE', departmentId: mktDept.id, value: 1200 },
    { name: 'Wireless Lavalier Mic Kit', category: 'Equipment', serialNo: 'MIC-001', status: 'AVAILABLE', departmentId: mktDept.id, value: 300 },
  ];

  const createdAssets = await Promise.all(
    assets.map(a => prisma.asset.create({ data: a as any }))
  );

  const mbp1 = createdAssets.find(a => a.serialNo === 'MBP-001')!;
  const mbp2 = createdAssets.find(a => a.serialNo === 'MBP-002')!;
  const xps1 = createdAssets.find(a => a.serialNo === 'DXPS-001')!;
  const tp1 = createdAssets.find(a => a.serialNo === 'TP-001')!;
  const monitorMaint = createdAssets.find(a => a.serialNo === 'DELL-M-002')!;

  // Allocations
  await prisma.allocation.create({ data: { assetId: mbp1.id, userId: emp1.id } });
  await prisma.allocation.create({ data: { assetId: mbp2.id, userId: emp2.id } });
  await prisma.allocation.create({ data: { assetId: xps1.id, userId: emp3.id } });
  await prisma.allocation.create({ data: { assetId: tp1.id, userId: emp4.id } });

  // Maintenance
  await prisma.maintenanceRequest.create({
    data: {
      assetId: mbp1.id,
      raisedById: emp1.id,
      description: 'Battery drains too fast, needs replacement',
      status: 'REQUESTED'
    }
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: monitorMaint.id,
      raisedById: engHead.id,
      approvedById: assetManager.id,
      description: 'Screen flickering issue',
      status: 'APPROVED'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
