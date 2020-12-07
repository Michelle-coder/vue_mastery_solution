let eventBus = new Vue();

Vue.component('info-tabs', {
    props: {shipping: {type: String, required: true}, details: {type: Array, required: true}, sizes: {type: Array, required: true}},
    template: `
    <div>
    <span class="tab" :class="{activeTab: selectedTab === tab}" v-for="(tab, index) in tabs"  :key="index" @click="selectedTab = tab">{{tab}}</span>
                <p v-show="selectedTab === 'Shipping'">Shipping: {{shipping}}</p>

             <ul v-show="selectedTab === 'Details'">
                <li v-for="detail in details">
                    {{detail}}
                </li>
            </ul>
            <ul v-show="selectedTab === 'Details'">
                <li v-for="size in sizes">{{size}}</li>
            </ul>
    
</div>`,
    data() {
        return {tabs: ['Shipping', 'Details'], selectedTab: 'Shipping'}
    }
});

Vue.component('product-tabs', {
    props: {reviews: {type: Array, required: true}},
    template: `
    <div>
    <span class="tab" :class="{ activeTab: selectedTab === tab}" v-for="(tab, index) in tabs" :key="index" @click="selectedTab = tab">{{tab}}</span>
   <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else><li v-for="review in reviews">
                <p>{{review.name}}</p>
                <p>Rating: {{review.rating}}</p>
                <p>{{review.review}}</p>
                <p>Recommendation: {{review.recommendation}}</p>
            </li></ul>
            </div>
            
            <product-review v-show="selectedTab === 'Make a Review'"></product-review>
</div>`,
    data() {
        return {tabs: ['Reviews', 'Make a Review'], selectedTab: 'Reviews'}
    }
});

Vue.component('product-review', {
    template: `   <form class="review-form" @submit.prevent="onSubmit">
<!--   .prevent prevents default behaviour like refreshing the site when submitting-->

       <p v-if="errors.length">
         <b>Please correct the following error(s):</b>
         <ul><li v-for="error in errors">
             {{error}}
           </li></ul>
       </p>

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review" ></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
          
      <p>Would you recommend this product?</p>
      <label for="yes">Yes<input type="radio" name="recommendation" id="yes" value="Yes" v-model="recommendation"/></label>
      <label for="no">No <input type="radio" name="recommendation" id="no" value="No" v-model="recommendation"/></label>
     
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>`,
    data() {
        return {name: null, review: null, rating: null, errors: [], recommendation: ""}
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.recommendation) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                };
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommendation = "";
            } else {
                if (!this.name) this.errors.push("Name required.");
                if (!this.rating) this.errors.push("Rating required.");
                if (!this.review) this.errors.push("Review required.");
                if (!this.recommendation) this.errors.push("Recommendation required.");
            }

        }
    }
});

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
        <div class="product-image"><img v-bind:src="image" v-bind:alt="altText"/></div>

        <div class="product-info">

            <h1>{{title}}</h1>
            <p :class="{outOfStock: !inStock}">In Stock</p>
            <span>{{sale}}</span>
            <a class="product-info" :href="link">Similar products</a>
            <info-tabs :shipping="shipping" :details="details" :sizes="sizes"></info-tabs>

         

            <div v-for="(variant, index) in variants" :key="variant.variantId" class="color-box" :style="{backgroundColor: variant.variantColor}"
                 @mouseover="updateProduct(index)">
            </div>
               
            <button v-on:click="addToCart" :disabled="!inStock" :class="{disabledButton: !inStock}">Add to Cart</button>
            <button @click="removeFromCart" :disabled="!variantInCart" :class="{disabledButton: !variantInCart}">Remove from Cart</button>
           
           <product-tabs :reviews="reviews"></product-tabs>
           
         
            </div>
            
            
            </div>`,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            description: 'nice socks, good price.',
            selectedVariant: 0,
            altText: 'pair of socks',
            link: 'https://www.wearethought.com/sustainable-socks/',
            onSale: true,
            details: ["80% cotton", "20% polyester", "organic", "fair"],
            variants: [{variantId: 2234, variantColor: "green", variantImage: './vmSocks-green-onWhite.jpg', variantQuantity: 4, variantQuantityInCart: 0},
                {variantId: 2235, variantColor: "blue", variantImage: './vmSocks-blue-onWhite.jpg', variantQuantity: 5, variantQuantityInCart: 0}],
            sizes: ["XS", "S", "M", "L", "XL"],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.variants[this.selectedVariant].variantQuantity -= 1;
            this.variants[this.selectedVariant].variantQuantityInCart += 1;
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
        removeFromCart() {
            this.variants[this.selectedVariant].variantQuantityInCart -= 1;
            this.variants[this.selectedVariant].variantQuantity += 1;
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        }

    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        },
        sale() {
            return this.onSale ? this.brand + ' ' + this.product + ' is on Sale!' : '';
        },
        shipping() {
            return this.premium ? "Free" : "2.99";
        },
        variantInCart() {
            return this.variants[this.selectedVariant].variantQuantityInCart > 0;
        }
    },
    mounted() {
        //    code I want to run when a certain event takes place
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
        });
    }


});


const app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        addToCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            let index = this.cart.indexOf(id);
            if (this.cart.length > 0 && index >= 0) {
                this.cart.splice(index, 1);
            }
        }
    },
});


