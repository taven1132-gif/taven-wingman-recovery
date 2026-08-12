-- TAVEN Marketplace Full Schema Migration
-- Migration: 0001_marketplace_schema
-- Status: BLOCKED-DB-001 — validated by code review and constraint tests only
-- NOTE: This migration cannot be applied until a live PostgreSQL is available

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MARKETPLACE_ADMIN', 'SELLER_ADMIN', 'STORE_MANAGER', 'OFFICE_ADMIN', 'VIEWER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED');
CREATE TYPE "MarketplaceStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "MarketplaceTemplate" AS ENUM ('COMMERCE_HUB', 'CREATOR_MARKET', 'B2B_EXCHANGE');
CREATE TYPE "SellerStatus" AS ENUM ('PENDING_APPLICATION', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'TERMINATED');
CREATE TYPE "SellerTier" AS ENUM ('STARTER', 'GROWTH', 'PROFESSIONAL', 'ENTERPRISE');
CREATE TYPE "SellerMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "StoreTemplate" AS ENUM ('FASHION', 'ELECTRONICS', 'ART_GALLERY', 'FOOD_BEVERAGES', 'SERVICES', 'GENERAL');
CREATE TYPE "StoreStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'CLOSED');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'DISCONTINUED');
CREATE TYPE "PublicationState" AS ENUM ('UNPUBLISHED', 'GATES_CHECKING', 'GATES_FAILED', 'GATES_PASSED', 'PUBLISHED', 'SUSPENDED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "DistributionType" AS ENUM ('AUTO', 'MANUAL', 'INVITE_ONLY');
CREATE TYPE "AdvertisingPolicyType" AS ENUM ('DENY_ALL', 'PLATFORM_ONLY', 'MARKETPLACE_APPROVED', 'SELF_SERVE');
CREATE TYPE "GrantType" AS ENUM ('CROSS_SELL', 'FULFILLMENT', 'ANALYTICS_VIEW', 'ADMIN_DELEGATE');

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaVerifiedAt" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "mfaStepUp" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MarketplaceTenant
CREATE TABLE "MarketplaceTenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "status" "MarketplaceStatus" NOT NULL DEFAULT 'DRAFT',
    "template" "MarketplaceTemplate" NOT NULL DEFAULT 'COMMERCE_HUB',
    "domain" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1a1a2e',
    "accentColor" TEXT NOT NULL DEFAULT '#d4af37',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "supportedLocales" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    CONSTRAINT "MarketplaceTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SellerOrg
CREATE TABLE "SellerOrg" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "status" "SellerStatus" NOT NULL DEFAULT 'PENDING_APPLICATION',
    "tier" "SellerTier" NOT NULL DEFAULT 'STARTER',
    "applicationData" JSONB,
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerOrg_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SellerOrgMember
CREATE TABLE "SellerOrgMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sellerOrgId" TEXT NOT NULL,
    "role" "SellerMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SellerOrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Store
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sellerOrgId" TEXT NOT NULL,
    "template" "StoreTemplate" NOT NULL DEFAULT 'GENERAL',
    "status" "StoreStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1a1a2e',
    "accentColor" TEXT NOT NULL DEFAULT '#d4af37',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sellerOrgId" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "publicationState" "PublicationState" NOT NULL DEFAULT 'UNPUBLISHED',
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "weight" DOUBLE PRECISION,
    "dimensions" JSONB,
    "images" TEXT[],
    "tags" TEXT[],
    "metadata" JSONB,
    "gatesPassedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable: StoreProduct
CREATE TABLE "StoreProduct" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manuallySelected" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "customPrice" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StoreProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ProductGateResult
CREATE TABLE "ProductGateResult" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "gateName" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "reason" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductGateResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PriceHistory
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "oldPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Category
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "marketplaceId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "sellerOrgId" TEXT NOT NULL,
    "storeId" TEXT,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "shippingAddress" JSONB,
    "billingAddress" JSONB,
    "notes" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable: OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SupplierDistribution
CREATE TABLE "SupplierDistribution" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "distributionType" "DistributionType" NOT NULL DEFAULT 'AUTO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "eligibilityCriteria" JSONB,
    "distributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AdvertisingPolicy
CREATE TABLE "AdvertisingPolicy" (
    "id" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "policyType" "AdvertisingPolicyType" NOT NULL DEFAULT 'DENY_ALL',
    "allowedRoles" "UserRole"[],
    "maxBudgetDaily" DOUBLE PRECISION,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdvertisingPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CrossMarketplaceGrant
CREATE TABLE "CrossMarketplaceGrant" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "marketplaceId" TEXT NOT NULL,
    "grantType" "GrantType" NOT NULL,
    "permissions" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrossMarketplaceGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_token_idx" ON "Session"("token");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE UNIQUE INDEX "MarketplaceTenant_slug_key" ON "MarketplaceTenant"("slug");
CREATE UNIQUE INDEX "MarketplaceTenant_domain_key" ON "MarketplaceTenant"("domain");
CREATE INDEX "MarketplaceTenant_slug_idx" ON "MarketplaceTenant"("slug");
CREATE INDEX "MarketplaceTenant_ownerId_idx" ON "MarketplaceTenant"("ownerId");
CREATE INDEX "MarketplaceTenant_status_idx" ON "MarketplaceTenant"("status");
CREATE UNIQUE INDEX "SellerOrg_slug_key" ON "SellerOrg"("slug");
CREATE UNIQUE INDEX "SellerOrg_slug_marketplaceId_key" ON "SellerOrg"("slug", "marketplaceId");
CREATE INDEX "SellerOrg_marketplaceId_status_idx" ON "SellerOrg"("marketplaceId", "status");
CREATE UNIQUE INDEX "SellerOrgMember_userId_sellerOrgId_key" ON "SellerOrgMember"("userId", "sellerOrgId");
CREATE UNIQUE INDEX "Store_slug_sellerOrgId_key" ON "Store"("slug", "sellerOrgId");
CREATE INDEX "Store_sellerOrgId_status_idx" ON "Store"("sellerOrgId", "status");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_sellerOrgId_status_idx" ON "Product"("sellerOrgId", "status");
CREATE INDEX "Product_marketplaceId_publicationState_idx" ON "Product"("marketplaceId", "publicationState");
CREATE INDEX "Product_sku_idx" ON "Product"("sku");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE UNIQUE INDEX "StoreProduct_storeId_productId_key" ON "StoreProduct"("storeId", "productId");
CREATE INDEX "StoreProduct_storeId_isActive_idx" ON "StoreProduct"("storeId", "isActive");
CREATE UNIQUE INDEX "ProductGateResult_productId_gateName_key" ON "ProductGateResult"("productId", "gateName");
CREATE INDEX "ProductGateResult_productId_idx" ON "ProductGateResult"("productId");
CREATE INDEX "PriceHistory_productId_changedAt_idx" ON "PriceHistory"("productId", "changedAt");
CREATE UNIQUE INDEX "Category_slug_marketplaceId_key" ON "Category"("slug", "marketplaceId");
CREATE INDEX "Category_marketplaceId_parentId_idx" ON "Category"("marketplaceId", "parentId");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_marketplaceId_status_idx" ON "Order"("marketplaceId", "status");
CREATE INDEX "Order_sellerOrgId_status_idx" ON "Order"("sellerOrgId", "status");
CREATE INDEX "Order_customerId_placedAt_idx" ON "Order"("customerId", "placedAt");
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE UNIQUE INDEX "SupplierDistribution_productId_marketplaceId_key" ON "SupplierDistribution"("productId", "marketplaceId");
CREATE INDEX "SupplierDistribution_marketplaceId_isActive_idx" ON "SupplierDistribution"("marketplaceId", "isActive");
CREATE UNIQUE INDEX "AdvertisingPolicy_marketplaceId_policyType_key" ON "AdvertisingPolicy"("marketplaceId", "policyType");
CREATE INDEX "CrossMarketplaceGrant_recipientId_marketplaceId_idx" ON "CrossMarketplaceGrant"("recipientId", "marketplaceId");
CREATE INDEX "CrossMarketplaceGrant_issuerId_idx" ON "CrossMarketplaceGrant"("issuerId");
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");
CREATE INDEX "AuditLog_action_timestamp_idx" ON "AuditLog"("action", "timestamp");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceTenant" ADD CONSTRAINT "MarketplaceTenant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SellerOrg" ADD CONSTRAINT "SellerOrg_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SellerOrgMember" ADD CONSTRAINT "SellerOrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerOrgMember" ADD CONSTRAINT "SellerOrgMember_sellerOrgId_fkey" FOREIGN KEY ("sellerOrgId") REFERENCES "SellerOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Store" ADD CONSTRAINT "Store_sellerOrgId_fkey" FOREIGN KEY ("sellerOrgId") REFERENCES "SellerOrg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerOrgId_fkey" FOREIGN KEY ("sellerOrgId") REFERENCES "SellerOrg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StoreProduct" ADD CONSTRAINT "StoreProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductGateResult" ADD CONSTRAINT "ProductGateResult_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerOrgId_fkey" FOREIGN KEY ("sellerOrgId") REFERENCES "SellerOrg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupplierDistribution" ADD CONSTRAINT "SupplierDistribution_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierDistribution" ADD CONSTRAINT "SupplierDistribution_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdvertisingPolicy" ADD CONSTRAINT "AdvertisingPolicy_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrossMarketplaceGrant" ADD CONSTRAINT "CrossMarketplaceGrant_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrossMarketplaceGrant" ADD CONSTRAINT "CrossMarketplaceGrant_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CrossMarketplaceGrant" ADD CONSTRAINT "CrossMarketplaceGrant_marketplaceId_fkey" FOREIGN KEY ("marketplaceId") REFERENCES "MarketplaceTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
