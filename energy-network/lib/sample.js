/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Close the bidding for a vehicle listing and choose the
 * highest bid that is over the asking price
 * @param {org.acme.energy.CloseBidding} closeBidding - the closeBidding transaction
 * @transaction
 */

 function closeBidding(closeBidding) {
   var listing = closeBidding.listing;
   if (listing.state !== 'AVAILABLE') {
     throw new Error('Sorry, is not available');
   }
   listing.state = 'RESERVE_NOT_MET';
   var highestOffer = null;
   var buyer = null;
   var seller = null;

   if (listing.offers && listing.offers.length > 0) {
     listing.offers.sort(function(a, b) {
       return(b.bidPrice - a.bidPrice);
     });
     highestOffer = listing.offers[0];
     if (highestOffer.bidPrice >= listing.price) {
       listing.state = 'IN_USE';
       buyer = highestOffer.neighbor;
       seller = listing.energy.owner;

       seller.balance += highestOffer.bidPrice;

       buyer.balance -= highestOffer.bidPrice;

       listing.energy.owner = buyer;

       listing.offers = null;
     }
   }

   return getAssetRegistry('org.acme.energy.Energy')
    .then(function(energyRegistry) {
      if (highestOffer) {
        return energyRegistry.update(listing.energy);
      } else {
        return true;
      }
    })
    .then(function() {
      return getAssetRegistry('org.acme.energy.EnergyListing');
    })
    .then(function(energyListingRegistry) {
      return energyListingRegistry.update(listing);
    })
    .then(function() {
      return getParticipantRegistry('org.acme.energy.Neighbor');
    })
    .then(function(userRegistry) {
      if(listing.state == 'IN_USE') {
        return userRegistry.updateAll([buyer, seller]);
      } else {
        return true;
      }
    });
 }

 /**
 * Make an Offer for a VehicleListing
 * @param {org.acme.energy.Offer} offer - the offer
 * @transaction
 */

function makeOffer(offer) {
  var listing = offer.listing;
  if (listing.state !== 'AVAILABLE') {
    throw new Error('This is not available');
  }
  if (listing.offers == null) {
    listing.offers = [];
  }
  listing.offers.push(offer);
  return getAssetRegistry('org.acme.energy.EnergyListing')
    .then(function(energyListingRegistry) {
      return energyListingRegistry.update(listing);
    });
}
