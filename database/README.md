# SmartPark Firestore

The Firebase Client SDK is used only for email/password authentication. The Express backend uses Firebase Admin for profiles, parking slots, reservations, QR verification, and activity logs. Firestore rules deny browser writes to all server-managed collections, preventing clients from bypassing transaction, ownership, and role checks.

Collections:

- `users/{uid}`: `uid`, `name`, `email`, optional `vehicleNumber`, `role`, `createdAt`, `updatedAt`
- `parkingSlots/{slotId}`: `id`, `slotNumber`, `name`, `status`, `isActive`, `currentReservationId`, `createdAt`, `updatedAt`
- `reservations/{reservationId}`: `id`, `userId`, `userName`, `userEmail`, `vehicleNumber`, `slotId`, `slotNumber`, `bookingDate`, `startTime`, `durationMinutes`, `status`, `qrToken`, `createdAt`, `updatedAt`
- `activityLogs/{activityId}`: `type`, `userId`, `reservationId`, `slotId`, `message`, `createdAt`

Deploy rules and indexes with the Firebase CLI after selecting the intended project. Seed six slots idempotently with `npm run seed` from `backend/` after configuring backend environment credentials.
