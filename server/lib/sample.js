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

  return getAssetRegistry('org.acme.energy.Next')
  .then(function(energyRegistry) {
    if (highestOffer) {
      return energyRegistry.update(listing.energy);
    } else {
      return true;
    }
  })
  .then(function() {
    return getAssetRegistry('org.acme.energy.Provision');
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
  return getAssetRegistry('org.acme.energy.Provision')
  .then(function(energyListingRegistry) {
    return energyListingRegistry.update(listing);
  });
}
