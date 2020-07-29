var eventBus = new Vue();

// product-details component
Vue.component('prdouct-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>
    `
})

// review component
Vue.component("product-review", {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
        
          <p class="error" v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
              <li v-for="error in errors">{{ error }}</li>
            </ul>
          </p>
  
          <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name">
          </p>
          
          <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
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
          <label>
            Yes
            <input type="radio" value="Yes" v-model="recommend"/>
          </label>
          <label>
            No
            <input type="radio" value="No" v-model="recommend"/>
          </label>
              
          <p>
            <input type="submit" value="Submit">  
          </p>    
        
      </form>
      `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        };
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                };
                eventBus.$emit("review-submitted", productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = null;
            } else {
                if (!this.name) this.errors.push("Name required.");
                if (!this.review) this.errors.push("Review required.");
                if (!this.rating) this.errors.push("Rating required.");
                if (!this.recommend) this.errors.push("Recommendation required.");
            }
        }
    }
});

// Tabs Component
Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>Name: {{ review.name }}</p>
                  <p>Rating: {{ review.rating }}</p>
                  <p>Review: {{ review.review }}</p>
                  <p>Recommended: {{ review.recommend }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

// product component
Vue.component('product', {
    props: {
        shipment: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class='product'>
        <div class="product-image column">
            <img v-bind:src='image' alt="shoe">
        </div>

        <div class="product-info column">
           
            <h1>{{ title }}</h1>
            <h4>{{ sale }}</h4>
            <p>{{ description }}</p>
            <p v-if="inStock">In Stock</p>
            <p v-else :class="{ outOfStock: inStock === 0 }">Out of Stock</p>
            <p>Shipping: {{ shipping }}</p>

            <div class="color-box" 
                v-for="(variant, index) in variants"
                :key="variant.variantId"
                :style="{ backgroundColor: variant.variantColor }"
                v-on:click="updateProduct(index)">
            </div>

            <h3>Details:</h3>
            <product-details :details="details"></product-details>

            <button v-on:click="addToCart" :disabled="!inStock" class="button" :class="{ disabledButton: !inStock }">
                Add to Cart
            </button>
            <button v-on:click="removeFromCart" :disabled="!inStock" class="button" :class="{ disabledButton: !inStock }">
                -
            </button>

            <product-tabs class="product-tabs" :reviews="reviews"></product-tabs>
        
        </div>

    </div>
    `,
    data() {
        return {
            brand: 'Nike',
            product: 'SuperRep Go',
            description: 'The Nike SuperRep Go combines comfortable foam cushioning, flexibility and support to get you moving in circuit-based fitness classes or while streaming workouts at home.',
            selectedVariant: 0,
            onSale: true,
            details: ["Soft", "Gender Neutral"],
            variants: [{
                variantId: 986,
                variantColor: 'gray',
                variantImage: "./assets/LightGrey.jpg",
                variantQuantity: 10,
            },
            {
                variantId: 985,
                variantColor: 'black',
                variantImage: "./assets/DarkSmoke.jpg",
                variantQuantity: 0,
            }],
            reviews: []
        };
    },
    methods: {
        addToCart: function () {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart: function () {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct: function (index) {
            this.selectedVariant = index
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on Sale!'
            }
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.shipment) {
                return "Free"
            }
            return 2
        }
    },
    mounted() {
        eventBus.$on('review-submitted', function (productReview) {
            this.reviews.push(productReview)
        }.bind(this))
    }
})

var item = new Vue({
    el: '#item',
    data: {
        shipment: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            this.cart.pop(id)
        }
    }
})