# SCM Portal - Complete API Mapping Specification

Comprehensive mapping of all REST microservice endpoints from the supplied Postman collection (`SCM_APIs.postman_collection.json`) to UI screens, domain service functions, HTTP methods, and payload structures.

---

## 1. User Administration (`/users`)

| Screen / Feature | Service Method | Method | Postman Endpoint Path | Parameters / Request Body | Response Envelope |
|---|---|---|---|---|---|
| **User Directory** | `userApi.getUsersList` | `GET` | `/scm-user-api/scm-user-api/users` | None | `User[]` |
| **Usernames Query** | `userApi.fetchUsernames` | `GET` | `/scm-user-api/scm-user-api/fetchusername` | `username` (Query) | `string[]` |
| **Fetch by Username** | `userApi.fetchUser` | `GET` | `/scm-user-api/scm-user-api/getUser/{username}` | `username` (Path) | `User` |
| **Verify HRMS & User** | `userApi.getUserByHrmsAndUsername` | `GET` | `/scm-user-api/scm-user-api/getUserwithHrmsIdandUsername` | `hrmsId`, `username`, `guiUsername` | `User` |
| **Send Registration OTP** | `masterdataApi.sendOtp` | `POST` | `/scm-db-api/masterdata-db-api/sendOtp` | `{ msisdn, operation: '10069', topic: 'UserCreation' }` | `{ message }` |
| **Validate OTP** | `masterdataApi.validateOtp` | `POST` | `/scm-db-api/masterdata-db-api/validateOtp` | `otp`, `operation`, `msisdn` | `{ valid: boolean }` |
| **Create User** | `userApi.createUser` | `POST` | `/scm-user-api/scm-user-api/usercreation` | `CreateUserPayload` (18 permission flags, geographic nodes, credentials) | `{ message, userId }` |
| **Modify User Profile** | `userApi.modifyUser` | `POST` | `/scm-user-api/scm-user-api/modifyUser` | `ModifyUserPayload` (`username`, `firstName`, `lastName`, `address`, `roleName`) | `{ message }` |
| **Get Permissions** | `userApi.getUserPermissions` | `GET` | `/scm-user-api/scm-user-api/getUserPermissionwithHrmsIdandUsername` | `hrmsId`, `username`, `guiUsername` | `UserPermissions` |
| **Modify Permissions** | `userApi.modifyPermissions` | `POST` | `/scm-user-api/scm-user-api/modifyPermissions` | `guiUser` (Query), `UserPermissions` (Body) | `{ message }` |
| **Status Check** | `userApi.userStatusCheck` | `GET` | `/scm-user-api/scm-user-api/userStatusCheck` | `username` | `{ status: number }` |
| **Change Status** | `userApi.changeUserStatus` | `POST` | `/scm-user-api/scm-user-api/userStatusChangewithHrmsIdandUsername` | `hrmsId`, `username`, `guiUsername`, `status` | `{ message, status }` |
| **Change Password** | `userApi.changePassword` | `POST` | `/scm-user-api/scm-user-api/changePassword` | `{ username, oldPassword, newPassword }` | `{ message }` |
| **Logout** | `userApi.logout` | `GET` | `/scm-user-api/scm-user-api/scmlogout` | `username` | `{ message }` |

---

## 2. Dealer Management (`/dealers`)

| Screen / Feature | Service Method | Method | Postman Endpoint Path | Parameters / Request Body | Response Envelope |
|---|---|---|---|---|---|
| **Dealer Directory** | `dealerApi.getDealerList` | `GET` | `/scm-dealer-api/scm-dealer-api/dealerList` | `msisdn`, `username` | `Dealer[]` |
| **Search by Mobile** | `dealerApi.fetchDealer` | `GET` | `/scm-dealer-api/scm-dealer-api/fetchDealer` | `mobile`, `gui_username` | `Dealer` |
| **Fetch Detailed Data** | `dealerApi.fetchDealerData` | `GET` | `/scm-dealer-api/scm-dealer-api/fetchDealerData` | `msisdn`, `gui_username` | `Dealer` |
| **Check PAN Duplicate** | `dealerApi.checkDealerByPan` | `GET` | `/scm-dealer-api/scm-dealer-api/checkDealerByPan` | `panId` | `{ exists: boolean }` |
| **Check Aadhaar UID** | `dealerApi.checkDealerByAadhar` | `GET` | `/scm-dealer-api/scm-dealer-api/checkDealerByAadhar` | `aadharId` | `{ exists: boolean }` |
| **Create Dealer** | `dealerApi.createDealer` | `POST` | `/scm-dealer-api/scm-dealer-api/createDealer` | `CreateDealerPayload` | `{ message, dealer }` |
| **Update Dealer** | `dealerApi.updateDealer` | `POST` | `/scm-dealer-api/scm-dealer-api/updateDealer` | `UpdateDealerPayload` | `{ message }` |
| **Status Check** | `dealerApi.checkDealerStatus` | `GET` | `/scm-dealer-api/scm-dealer-api/dealerStatusCheck` | `msisdn` | `{ status: string }` |
| **Toggle Status** | `dealerApi.changeDealerStatus` | `POST` | `/scm-dealer-api/scm-dealer-api/dealerStatusChange` | `msisdn`, `username`, `status` | `{ message }` |
| **Purge Dealer** | `dealerApi.purgeDealer` | `POST` | `/scm-dealer-api/scm-dealer-api/purgeDealer` | `msisdn`, `username` | `{ message }` |
| **Hierarchy Reassignment** | `dealerApi.changeDealerHierarchy` | `POST` | `/scm-dealer-api/scm-dealer-api/changeDealerHierarchy` | `srcMsisdn`, `parentMsisdn`, `guiUsername`, `type` | `{ message }` |
| **Reset Dealer MPIN** | `dealerApi.resetMpin` | `PUT` | `/scm-dealer-api/scm-dealer-api/resetMpin` | `msisdn`, `username` (OTP-protected) | `{ message }` |
| **Fetch Franchise Parent** | `dealerApi.getFranchise` | `GET` | `/scm-dealer-api/scm-dealer-api/franchise` | `msisdn` | `FranchiseInfo` |
| **Fetch Sub-Franchise** | `dealerApi.getSubFranchise` | `GET` | `/scm-dealer-api/scm-dealer-api/subFranchise` | `msisdn` | `SubFranchiseInfo` |

---

## 3. Commission Engine (`/commissions`)

| Screen / Feature | Service Method | Method | Postman Endpoint Path | Parameters / Request Body | Response Envelope |
|---|---|---|---|---|---|
| **Save Prepaid FRC Rule** | `commissionApi.saveCommissionConfig` | `POST` | `/scm-plans-api/scm-product-api/saveCommissionConfig` | `CreateCommissionPayload` (OTP-protected) | `{ message, config }` |
| **Bulk Zone FRC Rules** | `commissionApi.saveMultipleCommissionConfig` | `POST` | `/scm-plans-api/scm-product-api/savemultipleCommissionConfig` | `zoneId` (0 for All, or Zone ID), payload | `{ message }` |
| **Save Postpaid Rule** | `commissionApi.savePostpaidConfig` | `POST` | `/scm-plans-api/scm-product-api/postpaidCommissionConfig` | `CreateCommissionPayload` (OTP-protected) | `{ message, config }` |
| **Save Landline Rule** | `commissionApi.saveLandlineConfig` | `POST` | `/scm-plans-api/scm-product-api/landlineCommissionConfig` | `CreateCommissionPayload` (OTP-protected) | `{ message, config }` |
| **Fetch FRC Rules** | `commissionApi.fetchPrepaidFrcCommission` | `GET` | `/scm-plans-api/scm-product-api/fetchCommission` | `denomination`, `circleId`, `categoryId`, `commissionType=1` | `CommissionConfig[]` |
| **Fetch OTF Rules** | `commissionApi.fetchPrepaidOtfCommission` | `GET` | `/scm-plans-api/scm-product-api/fetchPrepaidOTFCommission` | `denomination`, `circleId`, `categoryId`, `commissionType` | `CommissionConfig[]` |
| **Fetch Postpaid Rules** | `commissionApi.fetchPostpaidCommission` | `GET` | `/scm-plans-api/scm-product-api/fetchPostpaidCommission` | `circleId`, `category`, `sellerLevel` | `CommissionConfig[]` |
| **Fetch Landline Rules** | `commissionApi.fetchLandlineCommission` | `POST` | `/scm-plans-api/scm-product-api/fetchLandlineCommission` | Filter payload | `CommissionConfig[]` |
| **Update FRC Rule** | `commissionApi.updateCommissionConfig` | `POST` | `/scm-plans-api/scm-product-api/updateCommissionConfig` | `UpdateCommissionPayload` | `{ message }` |
| **Update Postpaid Rule** | `commissionApi.updatePostpaidCommission` | `POST` | `/scm-plans-api/scm-product-api/updatePostpaidCommission` | `UpdateCommissionPayload` | `{ message }` |
| **Update Landline Rule** | `commissionApi.updateLandlineCommission` | `POST` | `/scm-plans-api/scm-product-api/updateLandlineCommission` | `UpdateCommissionPayload` | `{ message }` |
| **Delete FRC Rule** | `commissionApi.deleteCommissionConfig` | `POST` | `/scm-plans-api/scm-product-api/deleteCommissionConfig` | `commissionId` (OTP-protected) | `{ message }` |
| **Delete Postpaid Rule** | `commissionApi.deletePostpaidCommission` | `POST` | `/scm-plans-api/scm-product-api/deletePostpaidCommission` | `commissionId` (OTP-protected) | `{ message }` |
| **Delete Landline Rule** | `commissionApi.deleteLandlineCommission` | `POST` | `/scm-plans-api/scm-product-api/deleteLandlineCommission` | `commissionId` (OTP-protected) | `{ message }` |

---

## 4. Plans, Denominations, MNP & Numbers (`/plans`)

| Screen / Feature | Service Method | Method | Postman Endpoint Path | Parameters / Request Body | Response Envelope |
|---|---|---|---|---|---|
| **Tariff Plan Catalog** | `planApi.getPlans` | `GET` | `/scm-plans-api/scm-product-api/getplans` | None | `Plan[]` |
| **Add Plan** | `planApi.addPlan` | `POST` | `/scm-plans-api/scm-product-api/addplan` | `CreatePlanPayload`, `username` | `{ message, plan }` |
| **Update Plan** | `planApi.updatePlan` | `PUT` | `/scm-plans-api/scm-product-api/updateplan/{sno}` | `sno`, `UpdatePlanPayload`, `username` | `{ message }` |
| **Delete Plan** | `planApi.deletePlan` | `DELETE` | `/scm-plans-api/scm-product-api/deleteplan/{sno}` | `sno`, `username` (OTP-protected) | `{ message }` |
| **Recharge Plan Lookup** | `planApi.fetchRechargePlan` | `GET` | `/scm-plans-api/scm-product-api/rechargePlan` | `price`, `circleId`, `planType` | `Plan` |
| **Save Denomination** | `planApi.saveDenomination` | `POST` | `/scm-plans-api/scm-product-api/saveDenomination` | `price`, `circleId`, `validity` | `{ message }` |
| **Bulk Zone Denominations** | `planApi.saveMultipleDenominations` | `POST` | `/scm-plans-api/scm-product-api/saveMultipleDenominations` | `zoneId`, payload | `{ message }` |
| **Lookup MNP Record** | `masterdataApi.findMnpData` | `GET` | `/scm-db-api/masterdata-db-api/findMnpData` | `msisdn`, `username` | `MnpData[]` |
| **Register MNP Port-In** | `masterdataApi.saveMnp` | `POST` | `/scm-db-api/masterdata-db-api/savemnp` | `CreateMnpPayload` | `{ message, record }` |
| **Modify MNP Record** | `masterdataApi.modifyMnpData` | `POST` | `/scm-db-api/masterdata-db-api/modifyMnpData` | `UpdateMnpPayload` | `{ message }` |
| **Withdraw / Delete MNP** | `masterdataApi.deleteMnp` | `POST` | `/scm-db-api/masterdata-db-api/deleteMnp` | `msisdn`, `username` | `{ message }` |
| **Get Number Series** | `masterdataApi.getNumberSeries` | `GET` | `/scm-db-api/masterdata-db-api/getnumberseries` | `series`, `username` | `NumberSeries[]` |
| **Allocate Number Series** | `masterdataApi.addNumberSeries` | `POST` | `/scm-db-api/masterdata-db-api/addnumberseries` | `CreateNumberSeriesPayload`, `username` | `{ message, series }` |
| **Save Number Series** | `masterdataApi.saveNumberSeries` | `POST` | `/scm-db-api/masterdata-db-api/saveNumberSeries` | `CreateNumberSeriesPayload` | `{ message }` |
| **Edit Number Series** | `masterdataApi.editNumberSeries` | `PUT` | `/scm-db-api/masterdata-db-api/editnumberseries` | `UpdateNumberSeriesPayload`, `username` | `{ message }` |
| **Purge Number Series** | `masterdataApi.purgeNumberSeries` | `DELETE` | `/scm-db-api/masterdata-db-api/purgenumberseries` | `series`, `username` | `{ message }` |

---

## 5. Master Data & Geographic Cascade

| Screen / Feature | Service Method | Method | Postman Endpoint Path | Parameters / Request Body | Response Envelope |
|---|---|---|---|---|---|
| **Operational Zones** | `masterdataApi.getZones` | `GET` | `/scm-db-api/masterdata-db-api/zones` | None | `Zone[]` |
| **All Circles** | `masterdataApi.getCircles` | `GET` | `/scm-db-api/masterdata-db-api/circles` | `zoneCode` (Optional) | `Circle[]` |
| **Zone-Based Circles** | `masterdataApi.getZoneBasedCircles` | `GET` | `/scm-db-api/masterdata-db-api/zonebasedcircles` | `zoneId` | `Circle[]` |
| **HRMS Circles Info** | `masterdataApi.getCirclesInfo` | `GET` | `/scm-user-api/scm-user-api/getCirclesInfo` | `hrmsId` | `CircleInfo[]` |
| **SSAs by Circle** | `masterdataApi.getSSAs` | `GET` | `/scm-db-api/masterdata-db-api/ssas` | `circleId` | `SSA[]` |
| **Dealer Types** | `masterdataApi.getDealerTypes` | `GET` | `/scm-db-api/masterdata-db-api/dealerType` | None | `DealerType[]` |
| **Outlet Categories** | `masterdataApi.getCategory` | `GET` | `/scm-db-api/masterdata-db-api/getCategory` | None | `Category[]` |
| **Categories by Dealer** | `masterdataApi.getCategoryByDealer` | `GET` | `/scm-db-api/masterdata-db-api/getCategoryByDealer/{type}` | `dealerType` (Path) | `Category[]` |

---

## 6. Franchise Governance & Stock (`/reports`)

| Screen / Feature | Service Method | Method | Postman Endpoint Path | Parameters / Request Body | Response Envelope |
|---|---|---|---|---|---|
| **Top-up Transactions** | `franchiseApi.getTransactions` | `GET` | `/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalanceTransactions` | `circle` | `FranchiseTransaction[]` |
| **Approve Top-up** | `franchiseApi.approve` | `POST` | `/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalance/approve` | `transactionId`, `username` (OTP-protected) | `{ message }` |
| **Reject Top-up** | `franchiseApi.reject` | `POST` | `/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalance/reject` | `transactionId`, `reason`, `username` | `{ message }` |
| **Wallet Adjustment** | `walletApi.walletAdjustment` | `POST` | `/scm-stock-api/stock-api/walletAdjustment` | `msisdn`, `amount`, `reason`, `username` | `{ message, newBalance }` |
