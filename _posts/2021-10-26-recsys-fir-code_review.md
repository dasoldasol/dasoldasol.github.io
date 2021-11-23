---
title: "[논문구현]Feature Importance Ranking for Deep Learning(2020)"
excerpt: 'Wojtas, Maksymilian, and Ke Chen. "Feature importance ranking for deep learning." *arXiv preprint arXiv:2010.08973* (2020).'
categories:
- Deep Learning
- 추천시스템
- Feature Importance
- Feature Selection
modified_date: 2021-10-26 10:36:28 +0900
toc: true
toc_sticky: true
---
# FIR
- [논문 리뷰 : Feature Importance Ranking for Deep Learning(2020)](https://dasoldasol.github.io/deep%20learning/%EC%B6%94%EC%B2%9C%EC%8B%9C%EC%8A%A4%ED%85%9C/feature%20importance/feature%20selection/paper_review-recsys-fir/)
  ![image](https://dasoldasol.github.io/assets/images/image/FIR/Untitled1.png)

# Model

## Selector


```python
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import  Model
from tensorflow.keras.layers import Dense, Input, Flatten
from tensorflow.keras import backend as K
from tensorflow.keras.callbacks import TensorBoard


class SelectorNetwork:
    def __init__(self, mask_batch_size):
        print("============ SelectorNet start=============")
        self.batch_size = mask_batch_size
        self.mask_batch_size = mask_batch_size
        self.tr_loss_history = []
        self.te_loss_history = []
        self.y_pred_std_history = []
        self.y_true_std_history = []
        self.epoch_counter = 0
        self.data_masks = None
        self.data_targets = None
        self.best_performing_mask = None
        self.sample_weights = None

    def set_label_input_params(self, y_shape, y_input_layer):
        self.label_input_layer = y_input_layer
        self.label_shape = y_shape

    def create_dense_model(self, input_shape, dense_arch):
        input_mask_layer = Input(shape=input_shape)
        x = Flatten()(input_mask_layer)
        for i in range(len(dense_arch[:-1])):
            x = Dense(dense_arch[i], activation="sigmoid")(x)
        x = Dense(dense_arch[-1], activation="linear")(x)
        self.model = Model(inputs=[input_mask_layer], outputs=x)
        print("Subject Network model built:")
        #self.model.summary()

    def named_logs(self, model, logs):
        result = {}
        try:
            iterator = iter(logs)
        except TypeError:
            logs = [logs]
        for l in zip(model.metrics_names, logs):
            result[l[0]] = l[1]
        return result

    def compile_model(self):
        self.model.compile(loss='mae', optimizer=tf.keras.optimizers.Adam(learning_rate=0.01),
                           metrics=[self.get_y_std_metric(True), self.get_y_std_metric(False)])

    def train_one(self, epoch_number, apply_weights):  # train on data in object memory
        if apply_weights == False:
            curr_loss = self.model.train_on_batch(x=self.data_masks, y=self.data_targets)
        else:
            curr_loss = self.model.train_on_batch(x=self.data_masks, y=self.data_targets,
                                                  sample_weight=self.sample_weights)
        self.best_performing_mask = self.data_masks[np.argmin(self.data_targets, axis=0)]
        self.tr_loss_history.append(curr_loss)
        self.epoch_counter = epoch_number
        self.data_masks = None
        self.data_targets = None


    def append_data(self, x, y):
        if self.data_masks is None:
            self.data_masks = x
            self.data_targets = y
        else:
            self.data_masks = np.concatenate([self.data_masks, x], axis=0)
            self.data_targets = tf.concat([self.data_targets, y], axis=0)


    def test_one(self, x, y):
        y_pred = self.model.predict(x=x)
        curr_loss = self.model.test_on_batch(x=x, y=y)
        self.te_loss_history.append(curr_loss)
        return curr_loss

    def predict(self, x):
        y_pred = self.model.predict(x=x)
        return y_pred

    def get_y_std_metric(self, ifpred=True):
        def y_pred_std_metric(y_true, y_pred):
            y_pred_std = K.std(y_pred)
            self.y_pred_std_history.append(y_pred_std)
            return y_pred_std

        def y_true_std_metric(y_true, y_pred):
            y_true_std = K.std(y_true)
            self.y_true_std_history.append(y_true_std)
            return y_true_std

        if (ifpred == True):
            return y_pred_std_metric
        else:
            return y_true_std_metric
        
        
```

## Operator


```python
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Input, Flatten, Reshape, Conv2D, MaxPool2D
from tensorflow.keras.callbacks import TensorBoard
from tensorflow.keras.metrics import BinaryAccuracy, AUC


class OperatorNetwork:
    def __init__(self, x_batch_size, mask_batch_size, add_mopt_perf_metric=True,
                 use_early_stopping=True):
        print("============ OperatorNet start=============")
        self.batch_size = mask_batch_size * x_batch_size
        self.mask_batch_size = mask_batch_size
        self.x_batch_size = x_batch_size
        self.losses_per_sample = None
        # self.losses_per_sample = []
        self.tr_loss_history = []
        self.te_loss_history = []
        self.epoch_counter = 0
        self.add_mopt_perf_metric = add_mopt_perf_metric
        self.useEarlyStopping = use_early_stopping


    def create_dense_model(self, input_shape, dense_arch, last_activation="sigmoid"):
        self.x_shape = input_shape
        self.y_shape = dense_arch[-1]
        input_data_layer = Input(shape=input_shape)
        x = Flatten()(input_data_layer)
        input_mask_layer = Input(shape=input_shape)
        mask = Flatten()(input_mask_layer)
        x = tf.keras.layers.Concatenate(axis=1)([x, mask])
        for units in dense_arch[:-1]:
            x = Dense(units, activation="relu")(x)
        x = Dense(dense_arch[-1], activation=last_activation)(x)
        self.model = Model(inputs=[input_data_layer, input_mask_layer], outputs=x)
        print("Object network model built:")


    def create_batch(self, x, masks, y):
        """
        x =     [[1,2],[3,4]]       -> [[1,2],[1,2],[1,2],[3,4],[3,4],[3,4]]
        masks = [[0,0],[1,0],[1,1]] -> [[0,0],[1,0],[1,1],[0,0],[1,0],[1,1]]
        y =     [1,3]               -> [1    ,1    ,1    ,3    ,3    ,3    ]
        """
        # assert len(masks) == self.mask_size
        x_prim = np.repeat(x, len(masks), axis=0)
        y_prim = np.repeat(y, len(masks), axis=0)
        masks_prim = np.tile(masks, (len(x), 1))

        x_prim *= masks_prim  # MASKING
        # assert len(x_prim) == self.batch_size
        return x_prim, masks_prim, y_prim

    def named_logs(self, model, logs, mode="train"):
        result = {}
        try:
            iterator = iter(logs)
        except TypeError:
            logs = [logs]
        metricNames = (mode + "_" + i for i in model.metrics_names)
        for l in zip(metricNames, logs):
            result[l[0]] = l[1]
        return result

    def compile_model(self, loss_per_sample, combine_losses, combine_mask_losses, metrics=None, optimizer=tf.keras.optimizers.Nadam(learning_rate=0.01)):
        self.mask_loss_combine_function = combine_mask_losses
        if self.add_mopt_perf_metric is True:
            if metrics is None:
                metrics = [self.get_mopt_perf_metric()]
            else:
                metrics.append(self.get_mopt_perf_metric())

        def logging_loss_function(y_true, y_pred):
            losses = loss_per_sample(y_true, y_pred)
            self.losses_per_sample = losses
            return combine_losses(losses)

        self.model.compile(loss=logging_loss_function, optimizer=optimizer, metrics=metrics, run_eagerly=True)


    def get_per_mask_loss(self, used_target_shape=None):
        if used_target_shape is None:
            used_target_shape = (self.x_batch_size, self.mask_batch_size)
        losses = tf.reshape(self.losses_per_sample, used_target_shape)
        losses = self.mask_loss_combine_function(losses)
        return losses

    def get_per_mask_loss_with_custom_batch(self, losses, new_x_batch_size, new_mask_batch_size):
        losses = np.reshape(losses, newshape=(new_x_batch_size, new_mask_batch_size))
        losses = np.apply_along_axis(self.mask_loss_combine_function, 0, losses)
        return losses


    def train_one(self, x, masks, y):
        x_prim, masks_prim, y_prim = self.create_batch(x, masks, y)
        curr_loss = self.model.train_on_batch(x=[x_prim, masks_prim], y=y_prim)
        self.tr_loss_history.append(curr_loss)
        self.epoch_counter += 1
        return x_prim, masks_prim, y_prim
    

    def validate_one(self, x, masks, y):
        x_prim, masks_prim, y_prim = self.create_batch(x, masks, y)
        curr_loss = self.model.test_on_batch(x=[x_prim, masks_prim], y=y_prim)
        self.te_loss_history.append(curr_loss)
        if self.useEarlyStopping is True:
            self.check_ES()
        return x_prim, masks_prim, y_prim, self.losses_per_sample.numpy()


    def test_one(self, x, masks, y):
        x_prim, masks_prim, y_prim = self.create_batch(x, masks, y)
        curr_loss = self.model.test_on_batch(x=[x_prim, masks_prim], y=y_prim)
        self.te_loss_history.append(curr_loss)
        return curr_loss


    def get_mopt_perf_metric(self):
        # used_target_shape =  (self.x_batch_size,self.mask_batch_size)
        def m_opt_loss(y_pred, y_true):
            if (self.losses_per_sample.shape[0] % self.mask_batch_size != 0):  # when testing happens, not used anymore
                return 0.0
            else:  # for training and validation batches
                losses = tf.reshape(self.losses_per_sample, (-1, self.mask_batch_size))
                self.last_m_opt_perf = np.mean(losses[:, int(0.5 * self.mask_batch_size)])
                return self.last_m_opt_perf
        return m_opt_loss


    def set_early_stopping_params(self, starting_epoch, patience_batches=800, minimize=True):
        self.ES_patience = patience_batches
        self.ES_minimize = minimize
        if (minimize is True):
            self.ES_best_perf = 1000000.0
        else:
            self.ES_best_perf = -1000000.0
        self.ES_best_epoch = starting_epoch
        self.ES_stop_training = False
        self.ES_start_epoch = starting_epoch
        self.ES_best_weights = None
        return


    def check_ES(self, ):
        if self.epoch_counter >= self.ES_start_epoch:
            if self.ES_minimize is True:
                if self.last_m_opt_perf < self.ES_best_perf:
                    self.ES_best_perf = self.last_m_opt_perf
                    self.ES_best_epoch = self.epoch_counter
                    self.ES_best_weights = self.model.get_weights()
            else:
                if self.last_m_opt_perf > self.ES_best_perf:
                    self.ES_best_perf = self.last_m_opt_perf
                    self.ES_best_epoch = self.epoch_counter
                    self.ES_best_weights = self.model.get_weights()
            # print("ES patience left: "+str(self.epoch_counter-self.ES_best_epoch))
            if (self.epoch_counter - self.ES_best_epoch > self.ES_patience):
                self.ES_stop_training = True
```

## Mask Optimizer


```python
import numpy as np
import tensorflow as tf


class MaskOptimizer:
    def __init__(self, mask_batch_size, data_shape, unmasked_data_size,perturbation_size,
                 frac_of_rand_masks=0.5, epoch_condition=1000 ):
        print("============ MaskOptimizer start=============")
        self.data_shape = data_shape
        self.unmasked_data_size = unmasked_data_size
        self.data_size = np.zeros(data_shape).size
        self.mask_history = []
        self.raw_mask_history = []
        self.loss_history = []
        self.epoch_counter = 0
        self.mask_batch_size = mask_batch_size
        self.frac_of_rand_masks = frac_of_rand_masks
        self.epoch_condition = epoch_condition
        self.perturbation_size = perturbation_size
        self.max_optimization_iters = 5
        self.step_count_history = []


    def gradient(model, x):
        x_tensor = tf.convert_to_tensor(x, dtype=tf.float32)
        with tf.GradientTape() as t:
            t.watch(x_tensor)
            # loss_mask_size = (tf.norm(x_tensor,ord=2,axis=1))
            loss_model = model(x_tensor)
            loss = loss_model  # +0.001*loss_mask_size#*loss_mask_size
        return t.gradient(loss, x_tensor).numpy(), loss_model


    def new_get_mask_from_grads(grads, unmasked_size, mask_size):
        m_opt = np.zeros(shape=mask_size)
        top_arg_grad = np.argpartition(grads, -unmasked_size)[-unmasked_size:]
        m_opt[top_arg_grad] = 1
        return m_opt


    def new_get_m_opt(model, unmasked_size):
        input_img = np.ones(shape=model.layers[0].output_shape[0][1:])[None, :] / 2  # define an initial random image
        grad, loss = MaskOptimizer.gradient(model, input_img)
        grad = np.negative(np.squeeze(grad))  # change sign
        m_opt = MaskOptimizer.new_get_mask_from_grads(grad, unmasked_size, model.layers[0].output_shape[0][1:])
        return m_opt


    def new_check_for_opposite_grad(m_opt_grad, m_opt_indexes):
        m_opt_grad_cp = np.copy(m_opt_grad[m_opt_indexes])
        m_opt_arg_opposite_grad = np.argwhere(m_opt_grad_cp < 0)
        return m_opt_indexes[m_opt_arg_opposite_grad]


    def new_check_loss_for_opposite_indexes(model, m_opt, min_index, max_index, opposite_indexes):
        m_opt_changed = False
        m_opt_loss = model.predict(m_opt[None, :])
        for ind in opposite_indexes:
            m_new_opt = np.copy(m_opt)
            m_new_opt[max_index] = 1
            m_new_opt[ind] = 0
            m_new_opt_loss = model.predict(m_new_opt[None, :])
            if m_new_opt_loss < m_opt_loss:
                # print("Changed i "+str(max_index)+" from 0->1 and"+str(ind)+" from 1->0.")
                return True, m_new_opt
        return False, m_opt

    def new_check_for_likely_change(model, m_opt, min_index, max_index, m_opt_grad):
        m_opt_changed = False
        m_opt_loss = np.squeeze(model.predict(m_opt[None, :]))
        not_m_opt_indexes = np.argwhere(m_opt == 0)
        max_index = not_m_opt_indexes[np.argmax(m_opt_grad[not_m_opt_indexes])]
        m_new_opt = np.copy(m_opt)
        m_new_opt[min_index] = 0
        m_new_opt[max_index] = 1
        m_new_opt_loss = np.squeeze(model.predict(m_new_opt[None, :]))
        if (m_new_opt_loss < m_opt_loss):
            return True, m_new_opt
        else:
            return False, m_opt


    def get_opt_mask(self, unmasked_size, model, steps=None):
        m_opt = MaskOptimizer.new_get_m_opt(model, unmasked_size)
        repeat_optimization = True
        step_count = 0
        if steps is None:
            steps = self.max_optimization_iters
        while (repeat_optimization == True and step_count < steps):
            step_count += 1
            repeat_optimization = False
            m_opt_grad, m_opt_loss = MaskOptimizer.gradient(model, m_opt[None, :])
            m_opt_grad = -np.squeeze(m_opt_grad)
            m_opt_indexes = np.squeeze(np.argwhere(m_opt == 1))
            min_index = m_opt_indexes[np.argmin(m_opt_grad[m_opt_indexes])]
            not_m_opt_indexes = np.squeeze(np.argwhere(m_opt == 0))
            if (not_m_opt_indexes.size > 1):
                max_index = not_m_opt_indexes[np.argmax(m_opt_grad[not_m_opt_indexes])]
            elif (not_m_opt_indexes.size == 1):
                max_index = not_m_opt_indexes
            opposite_indexes = MaskOptimizer.new_check_for_opposite_grad(m_opt_grad, m_opt_indexes)
            repeat_optimization, m_opt = MaskOptimizer.new_check_loss_for_opposite_indexes(model, m_opt, min_index,
                                                                                           max_index,
                                                                                           opposite_indexes)
            if (repeat_optimization == True):
                continue
            repeat_optimization, m_opt = MaskOptimizer.new_check_for_likely_change(model, m_opt, min_index,
                                                                                   max_index, m_opt_grad)
            if (repeat_optimization == True):
                continue
        self.step_count_history.append(step_count - 1)
        return m_opt


    def check_condiditon(self):
        if (self.epoch_counter >= self.epoch_condition):
            return True
        else:
            return False


    def get_random_masks(self):
        masks_zero = np.zeros(shape=(self.mask_batch_size, self.data_size - self.unmasked_data_size))
        masks_one = np.ones(shape=(self.mask_batch_size, self.unmasked_data_size))
        masks = np.concatenate([masks_zero, masks_one], axis=1)
        masks_permuted = np.apply_along_axis(np.random.permutation, 1, masks)
        return masks_permuted


    def get_perturbed_masks(mask, n_masks, n_times=1):
        masks = np.tile(mask, (n_masks, 1))
        for i in range(n_times):
            masks = MaskOptimizer.perturb_masks(masks)
        return masks


    def perturb_masks(masks):
        def perturb_one_mask(mask):
            where_0 = np.nonzero(mask - 1)[0]
            where_1 = np.nonzero(mask)[0]
            i0 = np.random.randint(0, len(where_0), 1)
            i1 = np.random.randint(0, len(where_1), 1)
            mask[where_0[i0]] = 1
            mask[where_1[i1]] = 0
            return mask

        n_masks = len(masks)
        masks = np.apply_along_axis(perturb_one_mask, 1, masks)
        return masks


    def get_new_mask_batch(self, model, best_performing_mask,  gen_new_opt_mask):
        self.epoch_counter += 1
        print(f"mopt epoch_counter : {self.epoch_counter}")
        random_masks = self.get_random_masks()
        if (gen_new_opt_mask):
            self.mask_opt = self.get_opt_mask(self.unmasked_data_size, model)
        if (self.check_condiditon() is True):
            index = int(self.frac_of_rand_masks * self.mask_batch_size)

            random_masks[index] = self.mask_opt
            random_masks[index + 1] = best_performing_mask
            random_masks[index + 2:] = MaskOptimizer.get_perturbed_masks(random_masks[index],
                                                                         self.mask_batch_size - (index + 2),
                                                                         self.perturbation_size)
        return random_masks


    def get_mask_weights(self, tiling):
        w = np.ones(shape=self.mask_batch_size)
        index = int(self.frac_of_rand_masks * self.mask_batch_size)
        w[index] = 5
        w[index + 1] = 10
        return np.tile(w, tiling)
```

## Feature Selector


```python
import datetime
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import backend as K

def mean_squared_error(y_true, y_pred):
    return K.mean((y_true - y_pred) * (y_true - y_pred), axis=1)


def tf_mean_ax_0(losses):
    return tf.reduce_mean(losses, axis=0)


def progressbar(it, prefix="", size=60):
    count = len(it)

    def show(j):
        x = int(size * j / count)
        print("\r%s[%s%s] %i/%i" % (prefix, "#" * x, "." * (size - x), j, count), end=" ")

    show(0)
    for i, item in enumerate(it):
        yield item
        show(i + 1)
    print()


class FeatureSelector():
    def __init__(self, data_shape, unmasked_data_size, data_batch_size, mask_batch_size,
                 epoch_on_which_selector_trained=8):
        print("============ FeatureSelector start=============")
        self.data_shape = data_shape
        self.data_size = np.zeros(data_shape).size
        self.unmasked_data_size = unmasked_data_size
        self.data_batch_size = data_batch_size
        self.mask_batch_size = mask_batch_size
        self.x_batch_size = mask_batch_size * data_batch_size
        self.prev_mopt_condition = False
        self.epoch_on_which_selector_trained = epoch_on_which_selector_trained


    def create_dense_operator(self, arch, activation, metrics=None, error_func=mean_squared_error, es_patience=800):
        print("FeatureSelector.create_dense_operator start=============")
        self.operator = OperatorNetwork(self.data_batch_size, self.mask_batch_size)
        print("Creating operator model")
        self.operator.create_dense_model(self.data_shape, arch, activation)
        print("Compiling operator")
        self.operator.compile_model(error_func, tf.reduce_mean, tf_mean_ax_0, metrics, optimizer='nadam')
        print("Created operator")
        print("FeatureSelector.create_dense_operator end =============")
    

    def create_dense_selector(self, arch):
        print("FeatureSelector.create_dense_selector start=============")
        self.selector = SelectorNetwork(self.mask_batch_size)
        self.selector.create_dense_model(self.data_shape, arch)
        self.selector.compile_model()
        print("FeatureSelector.create_dense_selector end=============")


    def create_mask_optimizer(self, epoch_condition=5000, maximize_error=False, record_best_masks=False,
                              perturbation_size=2, use_new_optimization=False):
        print("FeatureSelector.create_mask_optimizer start=============")
        self.mopt = MaskOptimizer(self.mask_batch_size, self.data_shape, self.unmasked_data_size,
                                  epoch_condition=epoch_condition, perturbation_size=perturbation_size)
        self.selector.sample_weights = self.mopt.get_mask_weights(self.epoch_on_which_selector_trained)
        print("FeatureSelector.create_mask_optimizer end=============")


    def test_networks_on_data(self, x, y, masks):
        print("FeatureSelector.test_networks_on_data start=============")
        # x,y = self.udg.get_batch(number_of_data_batches)
        m = masks
        losses = self.operator.test_one(x, m, y)
        target_shape = (len(y), len(masks))
        losses = self.operator.get_per_mask_loss(target_shape)
        print("SN targets: " + str(losses))
        # print("SN mean targets: "+str(np.mean(losses,axis=0)))
        sn_preds = np.squeeze(self.selector.predict(m))
        print("SN preds: " + str(sn_preds))
        print("FeatureSelector.test_networks_on_data end=============")
        return losses


    def train_networks_on_data(self, x_tr, y_tr, number_of_batches, val_data=None, val_freq=16):
        print("FeatureSelector.train_networks_on_data start=============")
        use_val_data = True
        if val_data is None:
            use_val_data = False
        X_val = None
        y_val = None
        if (use_val_data is True):
            X_val = val_data[0]
            y_val = val_data[1]
        val_epoch = 0 

        for i in progressbar(range(number_of_batches), "Training batch: ", 50):
            mopt_condition = self.mopt.check_condiditon()

            random_indices = np.random.randint(0, len(x_tr), self.data_batch_size)
            random_indices2 = np.random.randint(0, len(X_val), self.data_batch_size)

            x = x_tr[random_indices, :]
            y = y_tr[random_indices]
            selector_train_condition = ((self.operator.epoch_counter % self.epoch_on_which_selector_trained) == 0)
            m = self.mopt.get_new_mask_batch(self.selector.model, self.selector.best_performing_mask,
                                             gen_new_opt_mask=selector_train_condition)

            self.operator.train_one(x, m, y)
            losses = self.operator.get_per_mask_loss()
            losses = losses.numpy()
            
            if i % 10 == 0:
                print("Train Epoch {:03d}: operator losses : {:.4f}".format(i, np.mean(losses)))

            self.selector.append_data(m, losses)
            if (selector_train_condition):
                self.selector.train_one(self.operator.epoch_counter, mopt_condition)

            self.prev_mopt_condition = mopt_condition

            if (use_val_data is True and self.operator.epoch_counter % val_freq == 0):
                print("validation start")
                xval = X_val[random_indices2, :]
                yval = y_val[random_indices2]
                print(f"val length : {yval.shape}")
                val_loss = self.operator.validate_one(xval, m, yval)
                print("Validation Epoch {:03d}".format(val_epoch))
                #self.operator.model.set_weights(self.operator.model)
                val_epoch+=1
            if (self.operator.useEarlyStopping is True and self.operator.ES_stop_training is True):
                print("Activate early stopping at training epoch/batch: " + str(self.operator.epoch_counter))
                print("Loading weights from epoch: " + str(self.operator.ES_best_epoch))
                self.operator.model.set_weights(self.operator.ES_best_weights)
                break
        print("FeatureSelector.train_networks_on_data end=============")
    

    def get_importances(self, return_chosen_features=True):
        print("FeatureSelector.get_importances start=============")
        features_opt_used = np.squeeze(
            np.argwhere(self.mopt.get_opt_mask(self.unmasked_data_size, self.selector.model, 12) == 1))
        m_best_used_features = np.zeros((1, self.data_size))
        m_best_used_features[0, features_opt_used] = 1
        grad_used_opt = -MaskOptimizer.gradient(self.selector.model, m_best_used_features)[0][0, :]
        importances = grad_used_opt
        if(return_chosen_features==False):
            print("FeatureSelector.get_importances end=============")
            return importances
        else:
            optimal_mask = m_best_used_features[0]
            print("FeatureSelector.get_importances end=============")
            return importances, optimal_mask
```

# Execute


```python

```

## Data Load(adult>=50k)


```python
from google.colab import drive
drive.mount('/content/drive')
data_path = "/content/drive/MyDrive/capstone/data/adult.data"
```


```python
ALL_FIELDS = ['age', 'workclass', 'fnlwgt', 'education', 'education-num',
             'marital-status', 'occupation', 'relationship', 'race',
             'sex', 'capital-gain', 'capital-loss', 'hours-per-week', 'country']
CONT_FIELDS = ['age', 'fnlwgt', 'education-num',
               'capital-gain', 'capital-loss', 'hours-per-week']
CAT_FIELDS = list(set(ALL_FIELDS).difference(CONT_FIELDS))

IS_BIN = True
NUM_BIN = 10
dataset_label = 'adult_'
```


```python
import tensorflow as tf 
import numpy as np
import os
import random

SEED = 1234


def seed_everything(seed: int = 1234):
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    tf.random.set_seed(seed)


seed_everything(SEED)
```


```python
## Data Load & Preprocess 
import numpy as np
import pandas as pd
from time import perf_counter
import tensorflow as tf
from sklearn.model_selection import train_test_split
from itertools import repeat
from sklearn.preprocessing import MinMaxScaler
import os
from numpy import count_nonzero


def get_sparsity(A):
    sparsity = 1.0 - count_nonzero(A) / A.size
    return sparsity


def to_categorical(columns, df):
    for col in columns:
        df[col] = df[col].astype('category')
    return df


def get_modified_data(X, all_fields, continuous_fields, categorical_fields, is_bin=False):
    field_dict = dict()
    field_index = []
    X_modified = pd.DataFrame()

    for index, col in enumerate(X.columns):
        if col not in all_fields:
            print("{} not included: Check your column list".format(col))
            raise ValueError

        if col in continuous_fields:
            scaler = MinMaxScaler()

            # 연속형 변수도 구간화 할 것인가?
            if is_bin:
                X_bin = pd.cut(scaler.fit_transform(X[[col]]).reshape(-1, ), NUM_BIN, labels=False)
                X_bin = pd.Series(X_bin).astype('str')

                X_bin_col = pd.get_dummies(X_bin, prefix=col, prefix_sep='-')
                field_dict[index] = list(X_bin_col.columns)
                field_index.extend(repeat(index, X_bin_col.shape[1]))
                X_modified = pd.concat([X_modified, X_bin_col], axis=1)

            else:
                X_cont_col = pd.DataFrame(scaler.fit_transform(X[[col]]), columns=[col])
                field_dict[index] = col
                field_index.append(index)
                X_modified = pd.concat([X_modified, X_cont_col], axis=1)

        if col in categorical_fields:
            X_cat_col = pd.get_dummies(X[col], prefix=col, prefix_sep='-')
            field_dict[index] = list(X_cat_col.columns)
            field_index.extend(repeat(index, X_cat_col.shape[1]))
            X_modified = pd.concat([X_modified, X_cat_col], axis=1)

    print('Data Prepared...')
    print('X shape: {}'.format(X_modified.shape))
    print('# of Feature: {}'.format(len(field_index)))
    print('# of Field: {}'.format(len(field_dict)))

    return field_dict, field_index, X_modified


def get_data():
    file = pd.read_csv(data_path, header=None)
    X = file.loc[:, 0:13]
    Y = file.loc[:, 14].map({' <=50K': 0, ' >50K': 1})

    X.columns = ALL_FIELDS
    field_dict, field_index, X_modified = \
        get_modified_data(X, ALL_FIELDS, CONT_FIELDS, CAT_FIELDS, IS_BIN)

    X_numpy = tf.cast(X_modified.values, tf.float32).numpy()
    sparsity = get_sparsity(X_numpy)
    print('Data Sparsity : {:.4f}'.format(sparsity))



    X_train, X_test, Y_train, Y_test = train_test_split(X_modified, Y, test_size=0.2, stratify=Y, shuffle=True, random_state=SEED)
    X_train, X_val, Y_train, Y_val = train_test_split(X_train, Y_train, test_size=0.25, stratify=Y_train, shuffle=True) # 0.25 x 0.8 = 0.2

    X_tr = tf.cast(X_train.values, tf.float32).numpy()
    y_tr = tf.cast(Y_train, tf.float32).numpy()
    X_val = tf.cast(X_val, tf.float32).numpy()
    y_val = tf.cast(Y_val, tf.float32).numpy()
    X_te = tf.cast(X_test.values, tf.float32).numpy()
    y_te = tf.cast(Y_test, tf.float32).numpy()


    return X_tr, y_tr, X_val, y_val, X_te, y_te, field_dict, field_index
```


```python
## Load Data
X_tr, y_tr, X_val, y_val, X_te, y_te, field_dict, field_index = get_data()
model_save_path = '/content/drive/MyDrive/capstone/result/adult/'
```

    Data Prepared...
    X shape: (32561, 157)
    # of Feature: 157
    # of Field: 14
    Data Sparsity : 0.9108


## Parameter Settings


```python
import numpy as np
import os
import tensorflow.keras as keras
from tensorflow.keras import backend as K

dataset_label = "_avazu"
NUM_BIN= 10
EMBEDDING_SIZE = 5

SEED = 1234
np.random.seed(SEED)

# Dataset parameters
N_FEATURES = len(field_index)
FEATURE_SHAPE = (N_FEATURES,)
num_feature=len(field_index),
num_field=len(field_dict)

# Training parapmeters for FIR
data_batch_size = 16 # BATCH_SIZE
mask_batch_size = 16 # BATCH_SIZ8
BATCH_SIZE = data_batch_size * mask_batch_size
# final batch_size is data_batch_size x mask_batch_size
fraction = 0.5
s = int(N_FEATURES*fraction)  # size of optimal subset that we are looking for
print(f"s={s}")
s_p = 2  # number of flipped bits in a mask when looking around m_opt
phase_2_start = 200  # after how many batches phase 2 will begin
max_batches = 750 # how many batches if the early stopping condition not satisfied
early_stopping_patience = 20  # how many patience batches (after phase 2 starts)
# before the training stops


operator_dense = [300, 200, 100, 1]
selector_dense = [300, 200, 100, 1]


model_save_path = '/content/drive/MyDrive/capstone/result/'
```


```python
%%time
print("********* FIR *****************")

# Create the framework, needs number of features and batch_sizes
fs = FeatureSelector(FEATURE_SHAPE, s, data_batch_size, mask_batch_size)

# Create a dense operator net, uses the architecture:
# with sigmoid activation in the final layer.
fs.create_dense_operator(
    operator_dense, "sigmoid", 
    metrics=[keras.metrics.AUC(), keras.metrics.BinaryAccuracy(), keras.metrics.Precision(), keras.metrics.Recall()],
                    error_func=K.binary_crossentropy)

# Ealy stopping activate after the phase2 of the training starts.
fs.operator.set_early_stopping_params(phase_2_start, patience_batches=early_stopping_patience, minimize=True)

# Create a dense selector net, uses the architecture:
fs.create_dense_selector(selector_dense)

# Set when the phase2 starts, what is the number of flipped bits when perturbin masks
fs.create_mask_optimizer(epoch_condition=phase_2_start, perturbation_size=s_p)

start = perf_counter()
#Train networks and set the maximum number of iterations
fs.train_networks_on_data(X_tr, y_tr, max_batches, val_data=(X_val, y_val))
time = perf_counter() - start
print("Training Time : {:.3f}".format(time))

#Results
fir_importances, optimal_mask = fs.get_importances(return_chosen_features=True)
fir_optimal_subset = np.nonzero(optimal_mask)
test_performance = fs.operator.test_one(X_te, optimal_mask[None,:], y_te)
print("Importances: ", fir_importances)
print("Optimal_subset: ", fir_optimal_subset)
print("Test performance (CE): ", test_performance[0])
print("Test performance (AUC): ", test_performance[1])
print("Test performance (ACC):", test_performance[2])
print("Test performance (precision):", test_performance[3])
print("Test performance (recall):", test_performance[4])
fs.operator.model.save_weights(
    model_save_path + 
    'fir-s({})-phase2start({})-max({})-batch({})-k({})-AUC({:.4f})-CE({:.4f})-ACC({:.4f})-Precision({:.4f})-Recall({:.4f})-th({})-time({:.2f})).h5'.format(
        fraction, phase_2_start,max_batches, data_batch_size, EMBEDDING_SIZE, test_performance[1],test_performance[0], test_performance[2], test_performance[3], test_performance[4], time
        )
    )
```

    ********* FIR *****************
    ============ FeatureSelector start=============
    FeatureSelector.create_dense_operator start=============
    ============ OperatorNet start=============
    Creating operator model
    Object network model built:
    Compiling operator
    Created operator
    FeatureSelector.create_dense_operator end =============
    FeatureSelector.create_dense_selector start=============
    ============ SelectorNet start=============
    Subject Network model built:
    FeatureSelector.create_dense_selector end=============
    FeatureSelector.create_mask_optimizer start=============
    ============ MaskOptimizer start=============
    FeatureSelector.create_mask_optimizer end=============
    FeatureSelector.train_networks_on_data start=============
    Training batch: [..................................................] 0/750 mopt epoch_counter : 1
    Train Epoch 000: operator losses : 0.8934
    Training batch: [..................................................] 1/750 mopt epoch_counter : 2
    Train Epoch 001: operator losses : 0.5683
    Training batch: [..................................................] 2/750 mopt epoch_counter : 3
    Train Epoch 002: operator losses : 0.5612
    Training batch: [..................................................] 3/750 mopt epoch_counter : 4
    Train Epoch 003: operator losses : 0.7003
    Training batch: [..................................................] 4/750 mopt epoch_counter : 5
    Train Epoch 004: operator losses : 0.5710
    Training batch: [..................................................] 5/750 mopt epoch_counter : 6
    Train Epoch 005: operator losses : 0.8005
    Training batch: [..................................................] 6/750 mopt epoch_counter : 7
    Train Epoch 006: operator losses : 0.5909
    Training batch: [..................................................] 7/750 mopt epoch_counter : 8
    Train Epoch 007: operator losses : 0.6140
    Training batch: [..................................................] 8/750 mopt epoch_counter : 9
    Train Epoch 008: operator losses : 0.4213
    Training batch: [..................................................] 9/750 mopt epoch_counter : 10
    Train Epoch 009: operator losses : 0.3054
    Training batch: [..................................................] 10/750 mopt epoch_counter : 11
    Train Epoch 010: operator losses : 0.6182
    Training batch: [..................................................] 11/750 mopt epoch_counter : 12
    Train Epoch 011: operator losses : 0.5673
    Training batch: [..................................................] 12/750 mopt epoch_counter : 13
    Train Epoch 012: operator losses : 0.4639
    Training batch: [..................................................] 13/750 mopt epoch_counter : 14
    Train Epoch 013: operator losses : 0.5605
    Training batch: [..................................................] 14/750 mopt epoch_counter : 15
    Train Epoch 014: operator losses : 0.6312
    Training batch: [#.................................................] 15/750 mopt epoch_counter : 16
    Train Epoch 015: operator losses : 0.6145
    Training batch: [#.................................................] 16/750 mopt epoch_counter : 17
    Train Epoch 016: operator losses : 0.4984
    Training batch: [#.................................................] 17/750 mopt epoch_counter : 18
    Train Epoch 017: operator losses : 0.4780
    Training batch: [#.................................................] 18/750 mopt epoch_counter : 19
    Train Epoch 018: operator losses : 0.3883
    Training batch: [#.................................................] 19/750 mopt epoch_counter : 20
    Train Epoch 019: operator losses : 0.7570
    Training batch: [#.................................................] 20/750 mopt epoch_counter : 21
    Train Epoch 020: operator losses : 0.6480
    Training batch: [#.................................................] 21/750 mopt epoch_counter : 22
    Train Epoch 021: operator losses : 0.4840
    Training batch: [#.................................................] 22/750 mopt epoch_counter : 23
    Train Epoch 022: operator losses : 0.3882
    Training batch: [#.................................................] 23/750 mopt epoch_counter : 24
    Train Epoch 023: operator losses : 0.4721
    Training batch: [#.................................................] 24/750 mopt epoch_counter : 25
    Train Epoch 024: operator losses : 0.4542
    Training batch: [#.................................................] 25/750 mopt epoch_counter : 26
    Train Epoch 025: operator losses : 0.4766
    Training batch: [#.................................................] 26/750 mopt epoch_counter : 27
    Train Epoch 026: operator losses : 0.3760
    Training batch: [#.................................................] 27/750 mopt epoch_counter : 28
    Train Epoch 027: operator losses : 0.3581
    Training batch: [#.................................................] 28/750 mopt epoch_counter : 29
    Train Epoch 028: operator losses : 0.7048
    Training batch: [#.................................................] 29/750 mopt epoch_counter : 30
    Train Epoch 029: operator losses : 0.6544
    Training batch: [##................................................] 30/750 mopt epoch_counter : 31
    Train Epoch 030: operator losses : 0.5599
    Training batch: [##................................................] 31/750 mopt epoch_counter : 32
    Train Epoch 031: operator losses : 0.6023
    Training batch: [##................................................] 32/750 mopt epoch_counter : 33
    Train Epoch 032: operator losses : 0.4274
    Training batch: [##................................................] 33/750 mopt epoch_counter : 34
    Train Epoch 033: operator losses : 0.6793
    Training batch: [##................................................] 34/750 mopt epoch_counter : 35
    Train Epoch 034: operator losses : 0.5867
    Training batch: [##................................................] 35/750 mopt epoch_counter : 36
    Train Epoch 035: operator losses : 0.5952
    Training batch: [##................................................] 36/750 mopt epoch_counter : 37
    Train Epoch 036: operator losses : 0.5606
    Training batch: [##................................................] 37/750 mopt epoch_counter : 38
    Train Epoch 037: operator losses : 0.4556
    Training batch: [##................................................] 38/750 mopt epoch_counter : 39
    Train Epoch 038: operator losses : 0.6404
    Training batch: [##................................................] 39/750 mopt epoch_counter : 40
    Train Epoch 039: operator losses : 0.3403
    Training batch: [##................................................] 40/750 mopt epoch_counter : 41
    Train Epoch 040: operator losses : 0.4657
    Training batch: [##................................................] 41/750 mopt epoch_counter : 42
    Train Epoch 041: operator losses : 0.5197
    Training batch: [##................................................] 42/750 mopt epoch_counter : 43
    Train Epoch 042: operator losses : 0.4757
    Training batch: [##................................................] 43/750 mopt epoch_counter : 44
    Train Epoch 043: operator losses : 0.4628
    Training batch: [##................................................] 44/750 mopt epoch_counter : 45
    Train Epoch 044: operator losses : 0.3549
    Training batch: [###...............................................] 45/750 mopt epoch_counter : 46
    Train Epoch 045: operator losses : 0.5565
    Training batch: [###...............................................] 46/750 mopt epoch_counter : 47
    Train Epoch 046: operator losses : 0.3848
    Training batch: [###...............................................] 47/750 mopt epoch_counter : 48
    Train Epoch 047: operator losses : 0.2513
    Training batch: [###...............................................] 48/750 mopt epoch_counter : 49
    Train Epoch 048: operator losses : 1.1857
    Training batch: [###...............................................] 49/750 mopt epoch_counter : 50
    Train Epoch 049: operator losses : 0.4756
    Training batch: [###...............................................] 50/750 mopt epoch_counter : 51
    Train Epoch 050: operator losses : 0.4974
    Training batch: [###...............................................] 51/750 mopt epoch_counter : 52
    Train Epoch 051: operator losses : 0.6123
    Training batch: [###...............................................] 52/750 mopt epoch_counter : 53
    Train Epoch 052: operator losses : 0.5305
    Training batch: [###...............................................] 53/750 mopt epoch_counter : 54
    Train Epoch 053: operator losses : 0.4218
    Training batch: [###...............................................] 54/750 mopt epoch_counter : 55
    Train Epoch 054: operator losses : 0.5665
    Training batch: [###...............................................] 55/750 mopt epoch_counter : 56
    Train Epoch 055: operator losses : 0.3664
    Training batch: [###...............................................] 56/750 mopt epoch_counter : 57
    Train Epoch 056: operator losses : 0.6380
    Training batch: [###...............................................] 57/750 mopt epoch_counter : 58
    Train Epoch 057: operator losses : 0.6536
    Training batch: [###...............................................] 58/750 mopt epoch_counter : 59
    Train Epoch 058: operator losses : 0.3961
    Training batch: [###...............................................] 59/750 mopt epoch_counter : 60
    Train Epoch 059: operator losses : 0.3626
    Training batch: [####..............................................] 60/750 mopt epoch_counter : 61
    Train Epoch 060: operator losses : 0.4474
    Training batch: [####..............................................] 61/750 mopt epoch_counter : 62
    Train Epoch 061: operator losses : 0.4745
    Training batch: [####..............................................] 62/750 mopt epoch_counter : 63
    Train Epoch 062: operator losses : 0.5400
    Training batch: [####..............................................] 63/750 mopt epoch_counter : 64
    Train Epoch 063: operator losses : 0.5129
    Training batch: [####..............................................] 64/750 mopt epoch_counter : 65
    Train Epoch 064: operator losses : 0.5107
    Training batch: [####..............................................] 65/750 mopt epoch_counter : 66
    Train Epoch 065: operator losses : 0.5201
    Training batch: [####..............................................] 66/750 mopt epoch_counter : 67
    Train Epoch 066: operator losses : 0.4152
    Training batch: [####..............................................] 67/750 mopt epoch_counter : 68
    Train Epoch 067: operator losses : 0.4445
    Training batch: [####..............................................] 68/750 mopt epoch_counter : 69
    Train Epoch 068: operator losses : 0.3129
    Training batch: [####..............................................] 69/750 mopt epoch_counter : 70
    Train Epoch 069: operator losses : 0.6036
    Training batch: [####..............................................] 70/750 mopt epoch_counter : 71
    Train Epoch 070: operator losses : 0.4588
    Training batch: [####..............................................] 71/750 mopt epoch_counter : 72
    Train Epoch 071: operator losses : 0.5296
    Training batch: [####..............................................] 72/750 mopt epoch_counter : 73
    Train Epoch 072: operator losses : 0.2882
    Training batch: [####..............................................] 73/750 mopt epoch_counter : 74
    Train Epoch 073: operator losses : 0.5558
    Training batch: [####..............................................] 74/750 mopt epoch_counter : 75
    Train Epoch 074: operator losses : 0.4604
    Training batch: [#####.............................................] 75/750 mopt epoch_counter : 76
    Train Epoch 075: operator losses : 0.3666
    Training batch: [#####.............................................] 76/750 mopt epoch_counter : 77
    Train Epoch 076: operator losses : 0.5483
    Training batch: [#####.............................................] 77/750 mopt epoch_counter : 78
    Train Epoch 077: operator losses : 0.4142
    Training batch: [#####.............................................] 78/750 mopt epoch_counter : 79
    Train Epoch 078: operator losses : 0.7508
    Training batch: [#####.............................................] 79/750 mopt epoch_counter : 80
    Train Epoch 079: operator losses : 0.6016
    Training batch: [#####.............................................] 80/750 mopt epoch_counter : 81
    Train Epoch 080: operator losses : 0.4657
    Training batch: [#####.............................................] 81/750 mopt epoch_counter : 82
    Train Epoch 081: operator losses : 0.4423
    Training batch: [#####.............................................] 82/750 mopt epoch_counter : 83
    Train Epoch 082: operator losses : 0.5648
    Training batch: [#####.............................................] 83/750 mopt epoch_counter : 84
    Train Epoch 083: operator losses : 0.3720
    Training batch: [#####.............................................] 84/750 mopt epoch_counter : 85
    Train Epoch 084: operator losses : 0.3513
    Training batch: [#####.............................................] 85/750 mopt epoch_counter : 86
    Train Epoch 085: operator losses : 0.7044
    Training batch: [#####.............................................] 86/750 mopt epoch_counter : 87
    Train Epoch 086: operator losses : 0.4820
    Training batch: [#####.............................................] 87/750 mopt epoch_counter : 88
    Train Epoch 087: operator losses : 0.3661
    Training batch: [#####.............................................] 88/750 mopt epoch_counter : 89
    Train Epoch 088: operator losses : 0.1887
    Training batch: [#####.............................................] 89/750 mopt epoch_counter : 90
    Train Epoch 089: operator losses : 0.7602
    Training batch: [######............................................] 90/750 mopt epoch_counter : 91
    Train Epoch 090: operator losses : 0.4229
    Training batch: [######............................................] 91/750 mopt epoch_counter : 92
    Train Epoch 091: operator losses : 0.3689
    Training batch: [######............................................] 92/750 mopt epoch_counter : 93
    Train Epoch 092: operator losses : 0.3749
    Training batch: [######............................................] 93/750 mopt epoch_counter : 94
    Train Epoch 093: operator losses : 0.2229
    Training batch: [######............................................] 94/750 mopt epoch_counter : 95
    Train Epoch 094: operator losses : 0.3505
    Training batch: [######............................................] 95/750 mopt epoch_counter : 96
    Train Epoch 095: operator losses : 0.2722
    Training batch: [######............................................] 96/750 mopt epoch_counter : 97
    Train Epoch 096: operator losses : 0.4100
    Training batch: [######............................................] 97/750 mopt epoch_counter : 98
    Train Epoch 097: operator losses : 0.4538
    Training batch: [######............................................] 98/750 mopt epoch_counter : 99
    Train Epoch 098: operator losses : 0.3928
    Training batch: [######............................................] 99/750 mopt epoch_counter : 100
    Train Epoch 099: operator losses : 0.4214
    Training batch: [######............................................] 100/750 mopt epoch_counter : 101
    Train Epoch 100: operator losses : 0.2741
    Training batch: [######............................................] 101/750 mopt epoch_counter : 102
    Train Epoch 101: operator losses : 0.5836
    Training batch: [######............................................] 102/750 mopt epoch_counter : 103
    Train Epoch 102: operator losses : 0.2729
    Training batch: [######............................................] 103/750 mopt epoch_counter : 104
    Train Epoch 103: operator losses : 0.3443
    Training batch: [######............................................] 104/750 mopt epoch_counter : 105
    Train Epoch 104: operator losses : 0.5155
    Training batch: [#######...........................................] 105/750 mopt epoch_counter : 106
    Train Epoch 105: operator losses : 0.4513
    Training batch: [#######...........................................] 106/750 mopt epoch_counter : 107
    Train Epoch 106: operator losses : 0.3680
    Training batch: [#######...........................................] 107/750 mopt epoch_counter : 108
    Train Epoch 107: operator losses : 0.3633
    Training batch: [#######...........................................] 108/750 mopt epoch_counter : 109
    Train Epoch 108: operator losses : 0.2864
    Training batch: [#######...........................................] 109/750 mopt epoch_counter : 110
    Train Epoch 109: operator losses : 0.3907
    Training batch: [#######...........................................] 110/750 mopt epoch_counter : 111
    Train Epoch 110: operator losses : 0.3788
    Training batch: [#######...........................................] 111/750 mopt epoch_counter : 112
    Train Epoch 111: operator losses : 0.3916
    Training batch: [#######...........................................] 112/750 mopt epoch_counter : 113
    Train Epoch 112: operator losses : 0.3078
    Training batch: [#######...........................................] 113/750 mopt epoch_counter : 114
    Train Epoch 113: operator losses : 0.3566
    Training batch: [#######...........................................] 114/750 mopt epoch_counter : 115
    Train Epoch 114: operator losses : 0.6127
    Training batch: [#######...........................................] 115/750 mopt epoch_counter : 116
    Train Epoch 115: operator losses : 0.6971
    Training batch: [#######...........................................] 116/750 mopt epoch_counter : 117
    Train Epoch 116: operator losses : 0.4466
    Training batch: [#######...........................................] 117/750 mopt epoch_counter : 118
    Train Epoch 117: operator losses : 0.2950
    Training batch: [#######...........................................] 118/750 mopt epoch_counter : 119
    Train Epoch 118: operator losses : 0.5945
    Training batch: [#######...........................................] 119/750 mopt epoch_counter : 120
    Train Epoch 119: operator losses : 0.2747
    Training batch: [########..........................................] 120/750 mopt epoch_counter : 121
    Train Epoch 120: operator losses : 0.5157
    Training batch: [########..........................................] 121/750 mopt epoch_counter : 122
    Train Epoch 121: operator losses : 0.4356
    Training batch: [########..........................................] 122/750 mopt epoch_counter : 123
    Train Epoch 122: operator losses : 0.3179
    Training batch: [########..........................................] 123/750 mopt epoch_counter : 124
    Train Epoch 123: operator losses : 0.4244
    Training batch: [########..........................................] 124/750 mopt epoch_counter : 125
    Train Epoch 124: operator losses : 0.3388
    Training batch: [########..........................................] 125/750 mopt epoch_counter : 126
    Train Epoch 125: operator losses : 0.3117
    Training batch: [########..........................................] 126/750 mopt epoch_counter : 127
    Train Epoch 126: operator losses : 0.1571
    Training batch: [########..........................................] 127/750 mopt epoch_counter : 128
    Train Epoch 127: operator losses : 0.5983
    Training batch: [########..........................................] 128/750 mopt epoch_counter : 129
    Train Epoch 128: operator losses : 0.4289
    Training batch: [########..........................................] 129/750 mopt epoch_counter : 130
    Train Epoch 129: operator losses : 0.3531
    Training batch: [########..........................................] 130/750 mopt epoch_counter : 131
    Train Epoch 130: operator losses : 0.3955
    Training batch: [########..........................................] 131/750 mopt epoch_counter : 132
    Train Epoch 131: operator losses : 0.4795
    Training batch: [########..........................................] 132/750 mopt epoch_counter : 133
    Train Epoch 132: operator losses : 0.4301
    Training batch: [########..........................................] 133/750 mopt epoch_counter : 134
    Train Epoch 133: operator losses : 0.3033
    Training batch: [########..........................................] 134/750 mopt epoch_counter : 135
    Train Epoch 134: operator losses : 0.3705
    Training batch: [#########.........................................] 135/750 mopt epoch_counter : 136
    Train Epoch 135: operator losses : 0.5858
    Training batch: [#########.........................................] 136/750 mopt epoch_counter : 137
    Train Epoch 136: operator losses : 0.5220
    Training batch: [#########.........................................] 137/750 mopt epoch_counter : 138
    Train Epoch 137: operator losses : 0.5445
    Training batch: [#########.........................................] 138/750 mopt epoch_counter : 139
    Train Epoch 138: operator losses : 0.2919
    Training batch: [#########.........................................] 139/750 mopt epoch_counter : 140
    Train Epoch 139: operator losses : 0.4099
    Training batch: [#########.........................................] 140/750 mopt epoch_counter : 141
    Train Epoch 140: operator losses : 0.2372
    Training batch: [#########.........................................] 141/750 mopt epoch_counter : 142
    Train Epoch 141: operator losses : 0.3644
    Training batch: [#########.........................................] 142/750 mopt epoch_counter : 143
    Train Epoch 142: operator losses : 0.5073
    Training batch: [#########.........................................] 143/750 mopt epoch_counter : 144
    Train Epoch 143: operator losses : 0.4671
    Training batch: [#########.........................................] 144/750 mopt epoch_counter : 145
    Train Epoch 144: operator losses : 0.2450
    Training batch: [#########.........................................] 145/750 mopt epoch_counter : 146
    Train Epoch 145: operator losses : 0.4926
    Training batch: [#########.........................................] 146/750 mopt epoch_counter : 147
    Train Epoch 146: operator losses : 0.2865
    Training batch: [#########.........................................] 147/750 mopt epoch_counter : 148
    Train Epoch 147: operator losses : 0.1857
    Training batch: [#########.........................................] 148/750 mopt epoch_counter : 149
    Train Epoch 148: operator losses : 0.2958
    Training batch: [#########.........................................] 149/750 mopt epoch_counter : 150
    Train Epoch 149: operator losses : 0.6528
    Training batch: [##########........................................] 150/750 mopt epoch_counter : 151
    Train Epoch 150: operator losses : 0.2914
    Training batch: [##########........................................] 151/750 mopt epoch_counter : 152
    Train Epoch 151: operator losses : 0.5116
    Training batch: [##########........................................] 152/750 mopt epoch_counter : 153
    Train Epoch 152: operator losses : 0.4047
    Training batch: [##########........................................] 153/750 mopt epoch_counter : 154
    Train Epoch 153: operator losses : 0.4681
    Training batch: [##########........................................] 154/750 mopt epoch_counter : 155
    Train Epoch 154: operator losses : 0.3409
    Training batch: [##########........................................] 155/750 mopt epoch_counter : 156
    Train Epoch 155: operator losses : 0.2911
    Training batch: [##########........................................] 156/750 mopt epoch_counter : 157
    Train Epoch 156: operator losses : 0.1600
    Training batch: [##########........................................] 157/750 mopt epoch_counter : 158
    Train Epoch 157: operator losses : 0.7661
    Training batch: [##########........................................] 158/750 mopt epoch_counter : 159
    Train Epoch 158: operator losses : 0.4407
    Training batch: [##########........................................] 159/750 mopt epoch_counter : 160
    Train Epoch 159: operator losses : 0.3450
    Training batch: [##########........................................] 160/750 mopt epoch_counter : 161
    Train Epoch 160: operator losses : 0.4586
    Training batch: [##########........................................] 161/750 mopt epoch_counter : 162
    Train Epoch 161: operator losses : 0.4475
    Training batch: [##########........................................] 162/750 mopt epoch_counter : 163
    Train Epoch 162: operator losses : 0.4318
    Training batch: [##########........................................] 163/750 mopt epoch_counter : 164
    Train Epoch 163: operator losses : 0.5547
    Training batch: [##########........................................] 164/750 mopt epoch_counter : 165
    Train Epoch 164: operator losses : 0.4641
    Training batch: [###########.......................................] 165/750 mopt epoch_counter : 166
    Train Epoch 165: operator losses : 0.3533
    Training batch: [###########.......................................] 166/750 mopt epoch_counter : 167
    Train Epoch 166: operator losses : 0.2778
    Training batch: [###########.......................................] 167/750 mopt epoch_counter : 168
    Train Epoch 167: operator losses : 0.2578
    Training batch: [###########.......................................] 168/750 mopt epoch_counter : 169
    Train Epoch 168: operator losses : 0.1820
    Training batch: [###########.......................................] 169/750 mopt epoch_counter : 170
    Train Epoch 169: operator losses : 0.5674
    Training batch: [###########.......................................] 170/750 mopt epoch_counter : 171
    Train Epoch 170: operator losses : 0.4054
    Training batch: [###########.......................................] 171/750 mopt epoch_counter : 172
    Train Epoch 171: operator losses : 0.5075
    Training batch: [###########.......................................] 172/750 mopt epoch_counter : 173
    Train Epoch 172: operator losses : 0.3920
    Training batch: [###########.......................................] 173/750 mopt epoch_counter : 174
    Train Epoch 173: operator losses : 0.4088
    Training batch: [###########.......................................] 174/750 mopt epoch_counter : 175
    Train Epoch 174: operator losses : 0.4977
    Training batch: [###########.......................................] 175/750 mopt epoch_counter : 176
    Train Epoch 175: operator losses : 0.5630
    Training batch: [###########.......................................] 176/750 mopt epoch_counter : 177
    Train Epoch 176: operator losses : 0.4343
    Training batch: [###########.......................................] 177/750 mopt epoch_counter : 178
    Train Epoch 177: operator losses : 0.3639
    Training batch: [###########.......................................] 178/750 mopt epoch_counter : 179
    Train Epoch 178: operator losses : 0.2925
    Training batch: [###########.......................................] 179/750 mopt epoch_counter : 180
    Train Epoch 179: operator losses : 0.7215
    Training batch: [############......................................] 180/750 mopt epoch_counter : 181
    Train Epoch 180: operator losses : 0.3118
    Training batch: [############......................................] 181/750 mopt epoch_counter : 182
    Train Epoch 181: operator losses : 0.2277
    Training batch: [############......................................] 182/750 mopt epoch_counter : 183
    Train Epoch 182: operator losses : 0.3182
    Training batch: [############......................................] 183/750 mopt epoch_counter : 184
    Train Epoch 183: operator losses : 0.4598
    Training batch: [############......................................] 184/750 mopt epoch_counter : 185
    Train Epoch 184: operator losses : 0.5541
    Training batch: [############......................................] 185/750 mopt epoch_counter : 186
    Train Epoch 185: operator losses : 0.5349
    Training batch: [############......................................] 186/750 mopt epoch_counter : 187
    Train Epoch 186: operator losses : 0.5290
    Training batch: [############......................................] 187/750 mopt epoch_counter : 188
    Train Epoch 187: operator losses : 0.5573
    Training batch: [############......................................] 188/750 mopt epoch_counter : 189
    Train Epoch 188: operator losses : 0.2634
    Training batch: [############......................................] 189/750 mopt epoch_counter : 190
    Train Epoch 189: operator losses : 0.4337
    Training batch: [############......................................] 190/750 mopt epoch_counter : 191
    Train Epoch 190: operator losses : 0.3643
    Training batch: [############......................................] 191/750 mopt epoch_counter : 192
    Train Epoch 191: operator losses : 0.4050
    Training batch: [############......................................] 192/750 mopt epoch_counter : 193
    Train Epoch 192: operator losses : 0.3919
    Training batch: [############......................................] 193/750 mopt epoch_counter : 194
    Train Epoch 193: operator losses : 0.4231
    Training batch: [############......................................] 194/750 mopt epoch_counter : 195
    Train Epoch 194: operator losses : 0.3707
    Training batch: [#############.....................................] 195/750 mopt epoch_counter : 196
    Train Epoch 195: operator losses : 0.2615
    Training batch: [#############.....................................] 196/750 mopt epoch_counter : 197
    Train Epoch 196: operator losses : 0.4766
    Training batch: [#############.....................................] 197/750 mopt epoch_counter : 198
    Train Epoch 197: operator losses : 0.2521
    Training batch: [#############.....................................] 198/750 mopt epoch_counter : 199
    Train Epoch 198: operator losses : 0.2932
    Training batch: [#############.....................................] 199/750 mopt epoch_counter : 200
    Train Epoch 199: operator losses : 0.2020
    Training batch: [#############.....................................] 200/750 mopt epoch_counter : 201
    Train Epoch 200: operator losses : 0.5278
    Training batch: [#############.....................................] 201/750 mopt epoch_counter : 202
    Train Epoch 201: operator losses : 0.3371
    Training batch: [#############.....................................] 202/750 mopt epoch_counter : 203
    Train Epoch 202: operator losses : 0.3049
    Training batch: [#############.....................................] 203/750 mopt epoch_counter : 204
    Train Epoch 203: operator losses : 0.3771
    Training batch: [#############.....................................] 204/750 mopt epoch_counter : 205
    Train Epoch 204: operator losses : 0.3180
    Training batch: [#############.....................................] 205/750 mopt epoch_counter : 206
    Train Epoch 205: operator losses : 0.3789
    Training batch: [#############.....................................] 206/750 mopt epoch_counter : 207
    Train Epoch 206: operator losses : 0.5267
    Training batch: [#############.....................................] 207/750 mopt epoch_counter : 208
    Train Epoch 207: operator losses : 0.2028
    Training batch: [#############.....................................] 208/750 mopt epoch_counter : 209
    Train Epoch 208: operator losses : 0.6826
    Training batch: [#############.....................................] 209/750 mopt epoch_counter : 210
    Train Epoch 209: operator losses : 0.5429
    Training batch: [##############....................................] 210/750 mopt epoch_counter : 211
    Train Epoch 210: operator losses : 0.5843
    Training batch: [##############....................................] 211/750 mopt epoch_counter : 212
    Train Epoch 211: operator losses : 0.3955
    Training batch: [##############....................................] 212/750 mopt epoch_counter : 213
    Train Epoch 212: operator losses : 0.4325
    Training batch: [##############....................................] 213/750 mopt epoch_counter : 214
    Train Epoch 213: operator losses : 0.4893
    Training batch: [##############....................................] 214/750 mopt epoch_counter : 215
    Train Epoch 214: operator losses : 0.3573
    Training batch: [##############....................................] 215/750 mopt epoch_counter : 216
    Train Epoch 215: operator losses : 0.5351
    Training batch: [##############....................................] 216/750 mopt epoch_counter : 217
    Train Epoch 216: operator losses : 0.4197
    Training batch: [##############....................................] 217/750 mopt epoch_counter : 218
    Train Epoch 217: operator losses : 0.4420
    Training batch: [##############....................................] 218/750 mopt epoch_counter : 219
    Train Epoch 218: operator losses : 0.4963
    Training batch: [##############....................................] 219/750 mopt epoch_counter : 220
    Train Epoch 219: operator losses : 0.4313
    Training batch: [##############....................................] 220/750 mopt epoch_counter : 221
    Train Epoch 220: operator losses : 0.4075
    Training batch: [##############....................................] 221/750 mopt epoch_counter : 222
    Train Epoch 221: operator losses : 0.4118
    Training batch: [##############....................................] 222/750 mopt epoch_counter : 223
    Train Epoch 222: operator losses : 0.4801
    Training batch: [##############....................................] 223/750 mopt epoch_counter : 224
    Train Epoch 223: operator losses : 0.4226
    Training batch: [##############....................................] 224/750 mopt epoch_counter : 225
    Train Epoch 224: operator losses : 0.2806
    Training batch: [###############...................................] 225/750 mopt epoch_counter : 226
    Train Epoch 225: operator losses : 0.3044
    Training batch: [###############...................................] 226/750 mopt epoch_counter : 227
    Train Epoch 226: operator losses : 0.2550
    Training batch: [###############...................................] 227/750 mopt epoch_counter : 228
    Train Epoch 227: operator losses : 0.4965
    Training batch: [###############...................................] 228/750 mopt epoch_counter : 229
    Train Epoch 228: operator losses : 0.3955
    Training batch: [###############...................................] 229/750 mopt epoch_counter : 230
    Train Epoch 229: operator losses : 0.5043
    Training batch: [###############...................................] 230/750 mopt epoch_counter : 231
    Train Epoch 230: operator losses : 0.4053
    Training batch: [###############...................................] 231/750 mopt epoch_counter : 232
    Train Epoch 231: operator losses : 0.8082
    Training batch: [###############...................................] 232/750 mopt epoch_counter : 233
    Train Epoch 232: operator losses : 0.5328
    Training batch: [###############...................................] 233/750 mopt epoch_counter : 234
    Train Epoch 233: operator losses : 0.5447
    Training batch: [###############...................................] 234/750 mopt epoch_counter : 235
    Train Epoch 234: operator losses : 0.2612
    Training batch: [###############...................................] 235/750 mopt epoch_counter : 236
    Train Epoch 235: operator losses : 0.5136
    Training batch: [###############...................................] 236/750 mopt epoch_counter : 237
    Train Epoch 236: operator losses : 0.3602
    Training batch: [###############...................................] 237/750 mopt epoch_counter : 238
    Train Epoch 237: operator losses : 0.2475
    Training batch: [###############...................................] 238/750 mopt epoch_counter : 239
    Train Epoch 238: operator losses : 0.6900
    Training batch: [###############...................................] 239/750 mopt epoch_counter : 240
    Train Epoch 239: operator losses : 0.4110
    Training batch: [################..................................] 240/750 mopt epoch_counter : 241
    Train Epoch 240: operator losses : 0.3786
    Training batch: [################..................................] 241/750 mopt epoch_counter : 242
    Train Epoch 241: operator losses : 0.4814
    Training batch: [################..................................] 242/750 mopt epoch_counter : 243
    Train Epoch 242: operator losses : 0.4623
    Training batch: [################..................................] 243/750 mopt epoch_counter : 244
    Train Epoch 243: operator losses : 0.4815
    Training batch: [################..................................] 244/750 mopt epoch_counter : 245
    Train Epoch 244: operator losses : 0.5270
    Training batch: [################..................................] 245/750 mopt epoch_counter : 246
    Train Epoch 245: operator losses : 0.2804
    Training batch: [################..................................] 246/750 mopt epoch_counter : 247
    Train Epoch 246: operator losses : 0.7529
    Training batch: [################..................................] 247/750 mopt epoch_counter : 248
    Train Epoch 247: operator losses : 0.4568
    Training batch: [################..................................] 248/750 mopt epoch_counter : 249
    Train Epoch 248: operator losses : 0.5148
    Training batch: [################..................................] 249/750 mopt epoch_counter : 250
    Train Epoch 249: operator losses : 0.3733
    Training batch: [################..................................] 250/750 mopt epoch_counter : 251
    Train Epoch 250: operator losses : 0.4889
    Training batch: [################..................................] 251/750 mopt epoch_counter : 252
    Train Epoch 251: operator losses : 0.2330
    Training batch: [################..................................] 252/750 mopt epoch_counter : 253
    Train Epoch 252: operator losses : 0.4377
    Training batch: [################..................................] 253/750 mopt epoch_counter : 254
    Train Epoch 253: operator losses : 0.1501
    Training batch: [################..................................] 254/750 mopt epoch_counter : 255
    Train Epoch 254: operator losses : 0.3113
    Training batch: [#################.................................] 255/750 mopt epoch_counter : 256
    Train Epoch 255: operator losses : 0.3647
    Training batch: [#################.................................] 256/750 mopt epoch_counter : 257
    Train Epoch 256: operator losses : 0.4403
    Training batch: [#################.................................] 257/750 mopt epoch_counter : 258
    Train Epoch 257: operator losses : 0.5334
    Training batch: [#################.................................] 258/750 mopt epoch_counter : 259
    Train Epoch 258: operator losses : 0.4203
    Training batch: [#################.................................] 259/750 mopt epoch_counter : 260
    Train Epoch 259: operator losses : 0.4666
    Training batch: [#################.................................] 260/750 mopt epoch_counter : 261
    Train Epoch 260: operator losses : 0.3518
    Training batch: [#################.................................] 261/750 mopt epoch_counter : 262
    Train Epoch 261: operator losses : 0.4244
    Training batch: [#################.................................] 262/750 mopt epoch_counter : 263
    Train Epoch 262: operator losses : 0.3750
    Training batch: [#################.................................] 263/750 mopt epoch_counter : 264
    Train Epoch 263: operator losses : 0.4287
    Training batch: [#################.................................] 264/750 mopt epoch_counter : 265
    Train Epoch 264: operator losses : 0.3126
    Training batch: [#################.................................] 265/750 mopt epoch_counter : 266
    Train Epoch 265: operator losses : 0.4360
    Training batch: [#################.................................] 266/750 mopt epoch_counter : 267
    Train Epoch 266: operator losses : 0.4213
    Training batch: [#################.................................] 267/750 mopt epoch_counter : 268
    Train Epoch 267: operator losses : 0.3657
    Training batch: [#################.................................] 268/750 mopt epoch_counter : 269
    Train Epoch 268: operator losses : 0.2821
    Training batch: [#################.................................] 269/750 mopt epoch_counter : 270
    Train Epoch 269: operator losses : 0.6572
    Training batch: [##################................................] 270/750 mopt epoch_counter : 271
    Train Epoch 270: operator losses : 0.5434
    Training batch: [##################................................] 271/750 mopt epoch_counter : 272
    Train Epoch 271: operator losses : 0.3929
    Training batch: [##################................................] 272/750 mopt epoch_counter : 273
    Train Epoch 272: operator losses : 0.4175
    Training batch: [##################................................] 273/750 mopt epoch_counter : 274
    Train Epoch 273: operator losses : 0.5812
    Training batch: [##################................................] 274/750 mopt epoch_counter : 275
    Train Epoch 274: operator losses : 0.4560
    Training batch: [##################................................] 275/750 mopt epoch_counter : 276
    Train Epoch 275: operator losses : 0.4102
    Training batch: [##################................................] 276/750 mopt epoch_counter : 277
    Train Epoch 276: operator losses : 0.4091
    Training batch: [##################................................] 277/750 mopt epoch_counter : 278
    Train Epoch 277: operator losses : 0.3907
    Training batch: [##################................................] 278/750 mopt epoch_counter : 279
    Train Epoch 278: operator losses : 0.3614
    Training batch: [##################................................] 279/750 mopt epoch_counter : 280
    Train Epoch 279: operator losses : 0.6344
    Training batch: [##################................................] 280/750 mopt epoch_counter : 281
    Train Epoch 280: operator losses : 0.3407
    Training batch: [##################................................] 281/750 mopt epoch_counter : 282
    Train Epoch 281: operator losses : 0.2227
    Training batch: [##################................................] 282/750 mopt epoch_counter : 283
    Train Epoch 282: operator losses : 0.3510
    Training batch: [##################................................] 283/750 mopt epoch_counter : 284
    Train Epoch 283: operator losses : 0.5506
    Training batch: [##################................................] 284/750 mopt epoch_counter : 285
    Train Epoch 284: operator losses : 0.3857
    Training batch: [###################...............................] 285/750 mopt epoch_counter : 286
    Train Epoch 285: operator losses : 0.3618
    Training batch: [###################...............................] 286/750 mopt epoch_counter : 287
    Train Epoch 286: operator losses : 0.3304
    Training batch: [###################...............................] 287/750 mopt epoch_counter : 288
    Train Epoch 287: operator losses : 0.2881
    Training batch: [###################...............................] 288/750 mopt epoch_counter : 289
    Train Epoch 288: operator losses : 0.2720
    Training batch: [###################...............................] 289/750 mopt epoch_counter : 290
    Train Epoch 289: operator losses : 0.4904
    Training batch: [###################...............................] 290/750 mopt epoch_counter : 291
    Train Epoch 290: operator losses : 0.4846
    Training batch: [###################...............................] 291/750 mopt epoch_counter : 292
    Train Epoch 291: operator losses : 0.4630
    Training batch: [###################...............................] 292/750 mopt epoch_counter : 293
    Train Epoch 292: operator losses : 0.2427
    Training batch: [###################...............................] 293/750 mopt epoch_counter : 294
    Train Epoch 293: operator losses : 0.4038
    Training batch: [###################...............................] 294/750 mopt epoch_counter : 295
    Train Epoch 294: operator losses : 0.3657
    Training batch: [###################...............................] 295/750 mopt epoch_counter : 296
    Train Epoch 295: operator losses : 0.5769
    Training batch: [###################...............................] 296/750 mopt epoch_counter : 297
    Train Epoch 296: operator losses : 0.3621
    Training batch: [###################...............................] 297/750 mopt epoch_counter : 298
    Train Epoch 297: operator losses : 0.4982
    Training batch: [###################...............................] 298/750 mopt epoch_counter : 299
    Train Epoch 298: operator losses : 0.4033
    Training batch: [###################...............................] 299/750 mopt epoch_counter : 300
    Train Epoch 299: operator losses : 0.3011
    Training batch: [####################..............................] 300/750 mopt epoch_counter : 301
    Train Epoch 300: operator losses : 0.2126
    Training batch: [####################..............................] 301/750 mopt epoch_counter : 302
    Train Epoch 301: operator losses : 0.4886
    Training batch: [####################..............................] 302/750 mopt epoch_counter : 303
    Train Epoch 302: operator losses : 0.2439
    Training batch: [####################..............................] 303/750 mopt epoch_counter : 304
    Train Epoch 303: operator losses : 0.3615
    Training batch: [####################..............................] 304/750 mopt epoch_counter : 305
    Train Epoch 304: operator losses : 0.5473
    Training batch: [####################..............................] 305/750 mopt epoch_counter : 306
    Train Epoch 305: operator losses : 0.4136
    Training batch: [####################..............................] 306/750 mopt epoch_counter : 307
    Train Epoch 306: operator losses : 0.2377
    Training batch: [####################..............................] 307/750 mopt epoch_counter : 308
    Train Epoch 307: operator losses : 0.3574
    Training batch: [####################..............................] 308/750 mopt epoch_counter : 309
    Train Epoch 308: operator losses : 0.5564
    Training batch: [####################..............................] 309/750 mopt epoch_counter : 310
    Train Epoch 309: operator losses : 0.3271
    Training batch: [####################..............................] 310/750 mopt epoch_counter : 311
    Train Epoch 310: operator losses : 0.2566
    Training batch: [####################..............................] 311/750 mopt epoch_counter : 312
    Train Epoch 311: operator losses : 0.2365
    Training batch: [####################..............................] 312/750 mopt epoch_counter : 313
    Train Epoch 312: operator losses : 0.3554
    Training batch: [####################..............................] 313/750 mopt epoch_counter : 314
    Train Epoch 313: operator losses : 0.4439
    Training batch: [####################..............................] 314/750 mopt epoch_counter : 315
    Train Epoch 314: operator losses : 0.5920
    Training batch: [#####################.............................] 315/750 mopt epoch_counter : 316
    Train Epoch 315: operator losses : 0.4066
    Training batch: [#####################.............................] 316/750 mopt epoch_counter : 317
    Train Epoch 316: operator losses : 0.2587
    Training batch: [#####################.............................] 317/750 mopt epoch_counter : 318
    Train Epoch 317: operator losses : 0.4777
    Training batch: [#####################.............................] 318/750 mopt epoch_counter : 319
    Train Epoch 318: operator losses : 0.3701
    Training batch: [#####################.............................] 319/750 mopt epoch_counter : 320
    Train Epoch 319: operator losses : 0.3691
    Training batch: [#####################.............................] 320/750 mopt epoch_counter : 321
    Train Epoch 320: operator losses : 0.2764
    Training batch: [#####################.............................] 321/750 mopt epoch_counter : 322
    Train Epoch 321: operator losses : 0.4762
    Training batch: [#####################.............................] 322/750 mopt epoch_counter : 323
    Train Epoch 322: operator losses : 0.3228
    Training batch: [#####################.............................] 323/750 mopt epoch_counter : 324
    Train Epoch 323: operator losses : 0.3029
    Training batch: [#####################.............................] 324/750 mopt epoch_counter : 325
    Train Epoch 324: operator losses : 0.2662
    Training batch: [#####################.............................] 325/750 mopt epoch_counter : 326
    Train Epoch 325: operator losses : 0.4378
    Training batch: [#####################.............................] 326/750 mopt epoch_counter : 327
    Train Epoch 326: operator losses : 0.3208
    Training batch: [#####################.............................] 327/750 mopt epoch_counter : 328
    Train Epoch 327: operator losses : 0.2487
    Training batch: [#####################.............................] 328/750 mopt epoch_counter : 329
    Train Epoch 328: operator losses : 0.1391
    Training batch: [#####################.............................] 329/750 mopt epoch_counter : 330
    Train Epoch 329: operator losses : 0.2383
    Training batch: [######################............................] 330/750 mopt epoch_counter : 331
    Train Epoch 330: operator losses : 0.5659
    Training batch: [######################............................] 331/750 mopt epoch_counter : 332
    Train Epoch 331: operator losses : 0.5718
    Training batch: [######################............................] 332/750 mopt epoch_counter : 333
    Train Epoch 332: operator losses : 0.3374
    Training batch: [######################............................] 333/750 mopt epoch_counter : 334
    Train Epoch 333: operator losses : 0.3380
    Training batch: [######################............................] 334/750 mopt epoch_counter : 335
    Train Epoch 334: operator losses : 0.2539
    Training batch: [######################............................] 335/750 mopt epoch_counter : 336
    Train Epoch 335: operator losses : 0.4928
    Training batch: [######################............................] 336/750 mopt epoch_counter : 337
    Train Epoch 336: operator losses : 0.4313
    Training batch: [######################............................] 337/750 mopt epoch_counter : 338
    Train Epoch 337: operator losses : 0.2099
    Training batch: [######################............................] 338/750 mopt epoch_counter : 339
    Train Epoch 338: operator losses : 0.5377
    Training batch: [######################............................] 339/750 mopt epoch_counter : 340
    Train Epoch 339: operator losses : 0.5353
    Training batch: [######################............................] 340/750 mopt epoch_counter : 341
    Train Epoch 340: operator losses : 0.4374
    Training batch: [######################............................] 341/750 mopt epoch_counter : 342
    Train Epoch 341: operator losses : 0.4297
    Training batch: [######################............................] 342/750 mopt epoch_counter : 343
    Train Epoch 342: operator losses : 0.1290
    Training batch: [######################............................] 343/750 mopt epoch_counter : 344
    Train Epoch 343: operator losses : 0.3127
    Training batch: [######################............................] 344/750 mopt epoch_counter : 345
    Train Epoch 344: operator losses : 0.6692
    Training batch: [#######################...........................] 345/750 mopt epoch_counter : 346
    Train Epoch 345: operator losses : 0.3499
    Training batch: [#######################...........................] 346/750 mopt epoch_counter : 347
    Train Epoch 346: operator losses : 0.2433
    Training batch: [#######################...........................] 347/750 mopt epoch_counter : 348
    Train Epoch 347: operator losses : 0.2760
    Training batch: [#######################...........................] 348/750 mopt epoch_counter : 349
    Train Epoch 348: operator losses : 0.5472
    Training batch: [#######################...........................] 349/750 mopt epoch_counter : 350
    Train Epoch 349: operator losses : 0.4136
    Training batch: [#######################...........................] 350/750 mopt epoch_counter : 351
    Train Epoch 350: operator losses : 0.1950
    Training batch: [#######################...........................] 351/750 mopt epoch_counter : 352
    Train Epoch 351: operator losses : 0.4856
    Training batch: [#######################...........................] 352/750 mopt epoch_counter : 353
    Train Epoch 352: operator losses : 0.4032
    Training batch: [#######################...........................] 353/750 mopt epoch_counter : 354
    Train Epoch 353: operator losses : 0.3221
    Training batch: [#######################...........................] 354/750 mopt epoch_counter : 355
    Train Epoch 354: operator losses : 0.4900
    Training batch: [#######################...........................] 355/750 mopt epoch_counter : 356
    Train Epoch 355: operator losses : 0.4956
    Training batch: [#######################...........................] 356/750 mopt epoch_counter : 357
    Train Epoch 356: operator losses : 0.3938
    Training batch: [#######################...........................] 357/750 mopt epoch_counter : 358
    Train Epoch 357: operator losses : 0.2311
    Training batch: [#######################...........................] 358/750 mopt epoch_counter : 359
    Train Epoch 358: operator losses : 0.4564
    Training batch: [#######################...........................] 359/750 mopt epoch_counter : 360
    Train Epoch 359: operator losses : 0.4862
    Training batch: [########################..........................] 360/750 mopt epoch_counter : 361
    Train Epoch 360: operator losses : 0.3320
    Training batch: [########################..........................] 361/750 mopt epoch_counter : 362
    Train Epoch 361: operator losses : 0.4258
    Training batch: [########################..........................] 362/750 mopt epoch_counter : 363
    Train Epoch 362: operator losses : 0.3929
    Training batch: [########################..........................] 363/750 mopt epoch_counter : 364
    Train Epoch 363: operator losses : 0.3189
    Training batch: [########################..........................] 364/750 mopt epoch_counter : 365
    Train Epoch 364: operator losses : 0.2492
    Training batch: [########################..........................] 365/750 mopt epoch_counter : 366
    Train Epoch 365: operator losses : 0.4524
    Training batch: [########################..........................] 366/750 mopt epoch_counter : 367
    Train Epoch 366: operator losses : 0.3954
    Training batch: [########################..........................] 367/750 mopt epoch_counter : 368
    Train Epoch 367: operator losses : 0.6977
    Training batch: [########################..........................] 368/750 mopt epoch_counter : 369
    Train Epoch 368: operator losses : 0.3421
    Training batch: [########################..........................] 369/750 mopt epoch_counter : 370
    Train Epoch 369: operator losses : 0.2833
    Training batch: [########################..........................] 370/750 mopt epoch_counter : 371
    Train Epoch 370: operator losses : 0.3777
    Training batch: [########################..........................] 371/750 mopt epoch_counter : 372
    Train Epoch 371: operator losses : 0.5312
    Training batch: [########################..........................] 372/750 mopt epoch_counter : 373
    Train Epoch 372: operator losses : 0.3481
    Training batch: [########################..........................] 373/750 mopt epoch_counter : 374
    Train Epoch 373: operator losses : 0.4133
    Training batch: [########################..........................] 374/750 mopt epoch_counter : 375
    Train Epoch 374: operator losses : 0.3048
    Training batch: [#########################.........................] 375/750 mopt epoch_counter : 376
    Train Epoch 375: operator losses : 0.5875
    Training batch: [#########################.........................] 376/750 mopt epoch_counter : 377
    Train Epoch 376: operator losses : 0.3607
    Training batch: [#########################.........................] 377/750 mopt epoch_counter : 378
    Train Epoch 377: operator losses : 0.4440
    Training batch: [#########################.........................] 378/750 mopt epoch_counter : 379
    Train Epoch 378: operator losses : 0.2001
    Training batch: [#########################.........................] 379/750 mopt epoch_counter : 380
    Train Epoch 379: operator losses : 0.4666
    Training batch: [#########################.........................] 380/750 mopt epoch_counter : 381
    Train Epoch 380: operator losses : 0.6643
    Training batch: [#########################.........................] 381/750 mopt epoch_counter : 382
    Train Epoch 381: operator losses : 0.4747
    Training batch: [#########################.........................] 382/750 mopt epoch_counter : 383
    Train Epoch 382: operator losses : 0.3785
    Training batch: [#########################.........................] 383/750 mopt epoch_counter : 384
    Train Epoch 383: operator losses : 0.4004
    Training batch: [#########################.........................] 384/750 mopt epoch_counter : 385
    Train Epoch 384: operator losses : 0.2942
    Training batch: [#########################.........................] 385/750 mopt epoch_counter : 386
    Train Epoch 385: operator losses : 0.4907
    Training batch: [#########################.........................] 386/750 mopt epoch_counter : 387
    Train Epoch 386: operator losses : 0.2838
    Training batch: [#########################.........................] 387/750 mopt epoch_counter : 388
    Train Epoch 387: operator losses : 0.3574
    Training batch: [#########################.........................] 388/750 mopt epoch_counter : 389
    Train Epoch 388: operator losses : 0.5985
    Training batch: [#########################.........................] 389/750 mopt epoch_counter : 390
    Train Epoch 389: operator losses : 0.2369
    Training batch: [##########################........................] 390/750 mopt epoch_counter : 391
    Train Epoch 390: operator losses : 0.3946
    Training batch: [##########################........................] 391/750 mopt epoch_counter : 392
    Train Epoch 391: operator losses : 0.4120
    Training batch: [##########################........................] 392/750 mopt epoch_counter : 393
    Train Epoch 392: operator losses : 0.3602
    Training batch: [##########################........................] 393/750 mopt epoch_counter : 394
    Train Epoch 393: operator losses : 0.5088
    Training batch: [##########################........................] 394/750 mopt epoch_counter : 395
    Train Epoch 394: operator losses : 0.4194
    Training batch: [##########################........................] 395/750 mopt epoch_counter : 396
    Train Epoch 395: operator losses : 0.4241
    Training batch: [##########################........................] 396/750 mopt epoch_counter : 397
    Train Epoch 396: operator losses : 0.2859
    Training batch: [##########################........................] 397/750 mopt epoch_counter : 398
    Train Epoch 397: operator losses : 0.3429
    Training batch: [##########################........................] 398/750 mopt epoch_counter : 399
    Train Epoch 398: operator losses : 0.3628
    Training batch: [##########################........................] 399/750 mopt epoch_counter : 400
    Train Epoch 399: operator losses : 0.3709
    Training batch: [##########################........................] 400/750 mopt epoch_counter : 401
    Train Epoch 400: operator losses : 0.3887
    Training batch: [##########################........................] 401/750 mopt epoch_counter : 402
    Train Epoch 401: operator losses : 0.2739
    Training batch: [##########################........................] 402/750 mopt epoch_counter : 403
    Train Epoch 402: operator losses : 0.2843
    Training batch: [##########################........................] 403/750 mopt epoch_counter : 404
    Train Epoch 403: operator losses : 0.3723
    Training batch: [##########################........................] 404/750 mopt epoch_counter : 405
    Train Epoch 404: operator losses : 0.5059
    Training batch: [###########################.......................] 405/750 mopt epoch_counter : 406
    Train Epoch 405: operator losses : 0.3344
    Training batch: [###########################.......................] 406/750 mopt epoch_counter : 407
    Train Epoch 406: operator losses : 0.3149
    Training batch: [###########################.......................] 407/750 mopt epoch_counter : 408
    Train Epoch 407: operator losses : 0.4161
    Training batch: [###########################.......................] 408/750 mopt epoch_counter : 409
    Train Epoch 408: operator losses : 0.2063
    Training batch: [###########################.......................] 409/750 mopt epoch_counter : 410
    Train Epoch 409: operator losses : 0.5367
    Training batch: [###########################.......................] 410/750 mopt epoch_counter : 411
    Train Epoch 410: operator losses : 0.4996
    Training batch: [###########################.......................] 411/750 mopt epoch_counter : 412
    Train Epoch 411: operator losses : 0.2301
    Training batch: [###########################.......................] 412/750 mopt epoch_counter : 413
    Train Epoch 412: operator losses : 0.3565
    Training batch: [###########################.......................] 413/750 mopt epoch_counter : 414
    Train Epoch 413: operator losses : 0.3866
    Training batch: [###########################.......................] 414/750 mopt epoch_counter : 415
    Train Epoch 414: operator losses : 0.1921
    Training batch: [###########################.......................] 415/750 mopt epoch_counter : 416
    Train Epoch 415: operator losses : 0.5556
    Training batch: [###########################.......................] 416/750 mopt epoch_counter : 417
    Train Epoch 416: operator losses : 0.3115
    Training batch: [###########################.......................] 417/750 mopt epoch_counter : 418
    Train Epoch 417: operator losses : 0.4190
    Training batch: [###########################.......................] 418/750 mopt epoch_counter : 419
    Train Epoch 418: operator losses : 0.4350
    Training batch: [###########################.......................] 419/750 mopt epoch_counter : 420
    Train Epoch 419: operator losses : 0.2217
    Training batch: [############################......................] 420/750 mopt epoch_counter : 421
    Train Epoch 420: operator losses : 0.2826
    Training batch: [############################......................] 421/750 mopt epoch_counter : 422
    Train Epoch 421: operator losses : 0.3106
    Training batch: [############################......................] 422/750 mopt epoch_counter : 423
    Train Epoch 422: operator losses : 0.5309
    Training batch: [############################......................] 423/750 mopt epoch_counter : 424
    Train Epoch 423: operator losses : 0.1784
    Training batch: [############################......................] 424/750 mopt epoch_counter : 425
    Train Epoch 424: operator losses : 0.3109
    Training batch: [############################......................] 425/750 mopt epoch_counter : 426
    Train Epoch 425: operator losses : 0.3647
    Training batch: [############################......................] 426/750 mopt epoch_counter : 427
    Train Epoch 426: operator losses : 0.2182
    Training batch: [############################......................] 427/750 mopt epoch_counter : 428
    Train Epoch 427: operator losses : 0.5358
    Training batch: [############################......................] 428/750 mopt epoch_counter : 429
    Train Epoch 428: operator losses : 0.3032
    Training batch: [############################......................] 429/750 mopt epoch_counter : 430
    Train Epoch 429: operator losses : 0.5002
    Training batch: [############################......................] 430/750 mopt epoch_counter : 431
    Train Epoch 430: operator losses : 0.3186
    Training batch: [############################......................] 431/750 mopt epoch_counter : 432
    Train Epoch 431: operator losses : 0.3934
    Training batch: [############################......................] 432/750 mopt epoch_counter : 433
    Train Epoch 432: operator losses : 0.2943
    Training batch: [############################......................] 433/750 mopt epoch_counter : 434
    Train Epoch 433: operator losses : 0.5447
    Training batch: [############################......................] 434/750 mopt epoch_counter : 435
    Train Epoch 434: operator losses : 0.4259
    Training batch: [#############################.....................] 435/750 mopt epoch_counter : 436
    Train Epoch 435: operator losses : 0.3845
    Training batch: [#############################.....................] 436/750 mopt epoch_counter : 437
    Train Epoch 436: operator losses : 0.3136
    Training batch: [#############################.....................] 437/750 mopt epoch_counter : 438
    Train Epoch 437: operator losses : 0.5656
    Training batch: [#############################.....................] 438/750 mopt epoch_counter : 439
    Train Epoch 438: operator losses : 0.3078
    Training batch: [#############################.....................] 439/750 mopt epoch_counter : 440
    Train Epoch 439: operator losses : 0.3268
    Training batch: [#############################.....................] 440/750 mopt epoch_counter : 441
    Train Epoch 440: operator losses : 0.2561
    Training batch: [#############################.....................] 441/750 mopt epoch_counter : 442
    Train Epoch 441: operator losses : 0.5922
    Training batch: [#############################.....................] 442/750 mopt epoch_counter : 443
    Train Epoch 442: operator losses : 0.3388
    Training batch: [#############################.....................] 443/750 mopt epoch_counter : 444
    Train Epoch 443: operator losses : 0.3870
    Training batch: [#############################.....................] 444/750 mopt epoch_counter : 445
    Train Epoch 444: operator losses : 0.3423
    Training batch: [#############################.....................] 445/750 mopt epoch_counter : 446
    Train Epoch 445: operator losses : 0.4277
    Training batch: [#############################.....................] 446/750 mopt epoch_counter : 447
    Train Epoch 446: operator losses : 0.4748
    Training batch: [#############################.....................] 447/750 mopt epoch_counter : 448
    Train Epoch 447: operator losses : 0.4098
    Training batch: [#############################.....................] 448/750 mopt epoch_counter : 449
    Train Epoch 448: operator losses : 0.2273
    Training batch: [#############################.....................] 449/750 mopt epoch_counter : 450
    Train Epoch 449: operator losses : 0.4709
    Training batch: [##############################....................] 450/750 mopt epoch_counter : 451
    Train Epoch 450: operator losses : 0.3258
    Training batch: [##############################....................] 451/750 mopt epoch_counter : 452
    Train Epoch 451: operator losses : 0.2773
    Training batch: [##############################....................] 452/750 mopt epoch_counter : 453
    Train Epoch 452: operator losses : 0.2200
    Training batch: [##############################....................] 453/750 mopt epoch_counter : 454
    Train Epoch 453: operator losses : 0.5844
    Training batch: [##############################....................] 454/750 mopt epoch_counter : 455
    Train Epoch 454: operator losses : 0.1910
    Training batch: [##############################....................] 455/750 mopt epoch_counter : 456
    Train Epoch 455: operator losses : 0.1406
    Training batch: [##############################....................] 456/750 mopt epoch_counter : 457
    Train Epoch 456: operator losses : 0.3230
    Training batch: [##############################....................] 457/750 mopt epoch_counter : 458
    Train Epoch 457: operator losses : 0.5148
    Training batch: [##############################....................] 458/750 mopt epoch_counter : 459
    Train Epoch 458: operator losses : 0.3418
    Training batch: [##############################....................] 459/750 mopt epoch_counter : 460
    Train Epoch 459: operator losses : 0.1581
    Training batch: [##############################....................] 460/750 mopt epoch_counter : 461
    Train Epoch 460: operator losses : 0.4197
    Training batch: [##############################....................] 461/750 mopt epoch_counter : 462
    Train Epoch 461: operator losses : 0.2602
    Training batch: [##############################....................] 462/750 mopt epoch_counter : 463
    Train Epoch 462: operator losses : 0.4834
    Training batch: [##############################....................] 463/750 mopt epoch_counter : 464
    Train Epoch 463: operator losses : 0.3136
    Training batch: [##############################....................] 464/750 mopt epoch_counter : 465
    Train Epoch 464: operator losses : 0.4395
    Training batch: [###############################...................] 465/750 mopt epoch_counter : 466
    Train Epoch 465: operator losses : 0.4890
    Training batch: [###############################...................] 466/750 mopt epoch_counter : 467
    Train Epoch 466: operator losses : 0.3752
    Training batch: [###############################...................] 467/750 mopt epoch_counter : 468
    Train Epoch 467: operator losses : 0.2836
    Training batch: [###############################...................] 468/750 mopt epoch_counter : 469
    Train Epoch 468: operator losses : 0.6124
    Training batch: [###############################...................] 469/750 mopt epoch_counter : 470
    Train Epoch 469: operator losses : 0.5251
    Training batch: [###############################...................] 470/750 mopt epoch_counter : 471
    Train Epoch 470: operator losses : 0.6941
    Training batch: [###############################...................] 471/750 mopt epoch_counter : 472
    Train Epoch 471: operator losses : 0.4332
    Training batch: [###############################...................] 472/750 mopt epoch_counter : 473
    Train Epoch 472: operator losses : 0.3380
    Training batch: [###############################...................] 473/750 mopt epoch_counter : 474
    Train Epoch 473: operator losses : 0.2237
    Training batch: [###############################...................] 474/750 mopt epoch_counter : 475
    Train Epoch 474: operator losses : 0.3794
    Training batch: [###############################...................] 475/750 mopt epoch_counter : 476
    Train Epoch 475: operator losses : 0.3231
    Training batch: [###############################...................] 476/750 mopt epoch_counter : 477
    Train Epoch 476: operator losses : 0.3708
    Training batch: [###############################...................] 477/750 mopt epoch_counter : 478
    Train Epoch 477: operator losses : 0.3019
    Training batch: [###############################...................] 478/750 mopt epoch_counter : 479
    Train Epoch 478: operator losses : 0.5235
    Training batch: [###############################...................] 479/750 mopt epoch_counter : 480
    Train Epoch 479: operator losses : 0.3529
    Training batch: [################################..................] 480/750 mopt epoch_counter : 481
    Train Epoch 480: operator losses : 0.5282
    Training batch: [################################..................] 481/750 mopt epoch_counter : 482
    Train Epoch 481: operator losses : 0.5045
    Training batch: [################################..................] 482/750 mopt epoch_counter : 483
    Train Epoch 482: operator losses : 0.3225
    Training batch: [################################..................] 483/750 mopt epoch_counter : 484
    Train Epoch 483: operator losses : 0.4968
    Training batch: [################################..................] 484/750 mopt epoch_counter : 485
    Train Epoch 484: operator losses : 0.3224
    Training batch: [################################..................] 485/750 mopt epoch_counter : 486
    Train Epoch 485: operator losses : 0.5707
    Training batch: [################################..................] 486/750 mopt epoch_counter : 487
    Train Epoch 486: operator losses : 0.3872
    Training batch: [################################..................] 487/750 mopt epoch_counter : 488
    Train Epoch 487: operator losses : 0.3894
    Training batch: [################################..................] 488/750 mopt epoch_counter : 489
    Train Epoch 488: operator losses : 0.2625
    Training batch: [################################..................] 489/750 mopt epoch_counter : 490
    Train Epoch 489: operator losses : 0.6318
    Training batch: [################################..................] 490/750 mopt epoch_counter : 491
    Train Epoch 490: operator losses : 0.1838
    Training batch: [################################..................] 491/750 mopt epoch_counter : 492
    Train Epoch 491: operator losses : 0.4771
    Training batch: [################################..................] 492/750 mopt epoch_counter : 493
    Train Epoch 492: operator losses : 0.4945
    Training batch: [################################..................] 493/750 mopt epoch_counter : 494
    Train Epoch 493: operator losses : 0.4246
    Training batch: [################################..................] 494/750 mopt epoch_counter : 495
    Train Epoch 494: operator losses : 0.3461
    Training batch: [#################################.................] 495/750 mopt epoch_counter : 496
    Train Epoch 495: operator losses : 0.4493
    Training batch: [#################################.................] 496/750 mopt epoch_counter : 497
    Train Epoch 496: operator losses : 0.4302
    Training batch: [#################################.................] 497/750 mopt epoch_counter : 498
    Train Epoch 497: operator losses : 0.5304
    Training batch: [#################################.................] 498/750 mopt epoch_counter : 499
    Train Epoch 498: operator losses : 0.3919
    Training batch: [#################################.................] 499/750 mopt epoch_counter : 500
    Train Epoch 499: operator losses : 0.4729
    Training batch: [#################################.................] 500/750 mopt epoch_counter : 501
    Train Epoch 500: operator losses : 0.3166
    Training batch: [#################################.................] 501/750 mopt epoch_counter : 502
    Train Epoch 501: operator losses : 0.1712
    Training batch: [#################################.................] 502/750 mopt epoch_counter : 503
    Train Epoch 502: operator losses : 0.4583
    Training batch: [#################################.................] 503/750 mopt epoch_counter : 504
    Train Epoch 503: operator losses : 0.2791
    Training batch: [#################################.................] 504/750 mopt epoch_counter : 505
    Train Epoch 504: operator losses : 0.1580
    Training batch: [#################################.................] 505/750 mopt epoch_counter : 506
    Train Epoch 505: operator losses : 0.6236
    Training batch: [#################################.................] 506/750 mopt epoch_counter : 507
    Train Epoch 506: operator losses : 0.2655
    Training batch: [#################################.................] 507/750 mopt epoch_counter : 508
    Train Epoch 507: operator losses : 0.4481
    Training batch: [#################################.................] 508/750 mopt epoch_counter : 509
    Train Epoch 508: operator losses : 0.1782
    Training batch: [#################################.................] 509/750 mopt epoch_counter : 510
    Train Epoch 509: operator losses : 0.4503
    Training batch: [##################################................] 510/750 mopt epoch_counter : 511
    Train Epoch 510: operator losses : 0.6553
    Training batch: [##################################................] 511/750 mopt epoch_counter : 512
    Train Epoch 511: operator losses : 0.2414
    Training batch: [##################################................] 512/750 mopt epoch_counter : 513
    Train Epoch 512: operator losses : 0.3703
    Training batch: [##################################................] 513/750 mopt epoch_counter : 514
    Train Epoch 513: operator losses : 0.2429
    Training batch: [##################################................] 514/750 mopt epoch_counter : 515
    Train Epoch 514: operator losses : 0.2980
    Training batch: [##################################................] 515/750 mopt epoch_counter : 516
    Train Epoch 515: operator losses : 0.4393
    Training batch: [##################################................] 516/750 mopt epoch_counter : 517
    Train Epoch 516: operator losses : 0.1813
    Training batch: [##################################................] 517/750 mopt epoch_counter : 518
    Train Epoch 517: operator losses : 0.4380
    Training batch: [##################################................] 518/750 mopt epoch_counter : 519
    Train Epoch 518: operator losses : 0.4996
    Training batch: [##################################................] 519/750 mopt epoch_counter : 520
    Train Epoch 519: operator losses : 0.2634
    Training batch: [##################################................] 520/750 mopt epoch_counter : 521
    Train Epoch 520: operator losses : 0.2282
    Training batch: [##################################................] 521/750 mopt epoch_counter : 522
    Train Epoch 521: operator losses : 0.4138
    Training batch: [##################################................] 522/750 mopt epoch_counter : 523
    Train Epoch 522: operator losses : 0.4638
    Training batch: [##################################................] 523/750 mopt epoch_counter : 524
    Train Epoch 523: operator losses : 0.1987
    Training batch: [##################################................] 524/750 mopt epoch_counter : 525
    Train Epoch 524: operator losses : 0.6221
    Training batch: [###################################...............] 525/750 mopt epoch_counter : 526
    Train Epoch 525: operator losses : 0.4705
    Training batch: [###################################...............] 526/750 mopt epoch_counter : 527
    Train Epoch 526: operator losses : 0.4818
    Training batch: [###################################...............] 527/750 mopt epoch_counter : 528
    Train Epoch 527: operator losses : 0.5348
    Training batch: [###################################...............] 528/750 mopt epoch_counter : 529
    Train Epoch 528: operator losses : 0.4376
    Training batch: [###################################...............] 529/750 mopt epoch_counter : 530
    Train Epoch 529: operator losses : 0.5030
    Training batch: [###################################...............] 530/750 mopt epoch_counter : 531
    Train Epoch 530: operator losses : 0.3746
    Training batch: [###################################...............] 531/750 mopt epoch_counter : 532
    Train Epoch 531: operator losses : 0.3795
    Training batch: [###################################...............] 532/750 mopt epoch_counter : 533
    Train Epoch 532: operator losses : 0.1958
    Training batch: [###################################...............] 533/750 mopt epoch_counter : 534
    Train Epoch 533: operator losses : 0.2851
    Training batch: [###################################...............] 534/750 mopt epoch_counter : 535
    Train Epoch 534: operator losses : 0.2074
    Training batch: [###################################...............] 535/750 mopt epoch_counter : 536
    Train Epoch 535: operator losses : 0.3400
    Training batch: [###################################...............] 536/750 mopt epoch_counter : 537
    Train Epoch 536: operator losses : 0.3732
    Training batch: [###################################...............] 537/750 mopt epoch_counter : 538
    Train Epoch 537: operator losses : 0.6502
    Training batch: [###################################...............] 538/750 mopt epoch_counter : 539
    Train Epoch 538: operator losses : 0.4010
    Training batch: [###################################...............] 539/750 mopt epoch_counter : 540
    Train Epoch 539: operator losses : 0.3837
    Training batch: [####################################..............] 540/750 mopt epoch_counter : 541
    Train Epoch 540: operator losses : 0.4005
    Training batch: [####################################..............] 541/750 mopt epoch_counter : 542
    Train Epoch 541: operator losses : 0.2255
    Training batch: [####################################..............] 542/750 mopt epoch_counter : 543
    Train Epoch 542: operator losses : 0.3795
    Training batch: [####################################..............] 543/750 mopt epoch_counter : 544
    Train Epoch 543: operator losses : 0.4847
    Training batch: [####################################..............] 544/750 mopt epoch_counter : 545
    Train Epoch 544: operator losses : 0.2987
    Training batch: [####################################..............] 545/750 mopt epoch_counter : 546
    Train Epoch 545: operator losses : 0.2166
    Training batch: [####################################..............] 546/750 mopt epoch_counter : 547
    Train Epoch 546: operator losses : 0.3292
    Training batch: [####################################..............] 547/750 mopt epoch_counter : 548
    Train Epoch 547: operator losses : 0.4537
    Training batch: [####################################..............] 548/750 mopt epoch_counter : 549
    Train Epoch 548: operator losses : 0.4733
    Training batch: [####################################..............] 549/750 mopt epoch_counter : 550
    Train Epoch 549: operator losses : 0.4431
    Training batch: [####################################..............] 550/750 mopt epoch_counter : 551
    Train Epoch 550: operator losses : 0.3272
    Training batch: [####################################..............] 551/750 mopt epoch_counter : 552
    Train Epoch 551: operator losses : 0.4484
    Training batch: [####################################..............] 552/750 mopt epoch_counter : 553
    Train Epoch 552: operator losses : 0.1714
    Training batch: [####################################..............] 553/750 mopt epoch_counter : 554
    Train Epoch 553: operator losses : 0.3743
    Training batch: [####################################..............] 554/750 mopt epoch_counter : 555
    Train Epoch 554: operator losses : 0.4797
    Training batch: [#####################################.............] 555/750 mopt epoch_counter : 556
    Train Epoch 555: operator losses : 0.1619
    Training batch: [#####################################.............] 556/750 mopt epoch_counter : 557
    Train Epoch 556: operator losses : 0.2496
    Training batch: [#####################################.............] 557/750 mopt epoch_counter : 558
    Train Epoch 557: operator losses : 0.3170
    Training batch: [#####################################.............] 558/750 mopt epoch_counter : 559
    Train Epoch 558: operator losses : 0.1960
    Training batch: [#####################################.............] 559/750 mopt epoch_counter : 560
    Train Epoch 559: operator losses : 0.3835
    Training batch: [#####################################.............] 560/750 mopt epoch_counter : 561
    Train Epoch 560: operator losses : 0.3549
    Training batch: [#####################################.............] 561/750 mopt epoch_counter : 562
    Train Epoch 561: operator losses : 0.2408
    Training batch: [#####################################.............] 562/750 mopt epoch_counter : 563
    Train Epoch 562: operator losses : 0.4759
    Training batch: [#####################################.............] 563/750 mopt epoch_counter : 564
    Train Epoch 563: operator losses : 0.3320
    Training batch: [#####################################.............] 564/750 mopt epoch_counter : 565
    Train Epoch 564: operator losses : 0.1384
    Training batch: [#####################################.............] 565/750 mopt epoch_counter : 566
    Train Epoch 565: operator losses : 0.4259
    Training batch: [#####################################.............] 566/750 mopt epoch_counter : 567
    Train Epoch 566: operator losses : 0.2758
    Training batch: [#####################################.............] 567/750 mopt epoch_counter : 568
    Train Epoch 567: operator losses : 0.2647
    Training batch: [#####################################.............] 568/750 mopt epoch_counter : 569
    Train Epoch 568: operator losses : 0.3683
    Training batch: [#####################################.............] 569/750 mopt epoch_counter : 570
    Train Epoch 569: operator losses : 0.3221
    Training batch: [######################################............] 570/750 mopt epoch_counter : 571
    Train Epoch 570: operator losses : 0.5292
    Training batch: [######################################............] 571/750 mopt epoch_counter : 572
    Train Epoch 571: operator losses : 0.3633
    Training batch: [######################################............] 572/750 mopt epoch_counter : 573
    Train Epoch 572: operator losses : 0.2334
    Training batch: [######################################............] 573/750 mopt epoch_counter : 574
    Train Epoch 573: operator losses : 0.4417
    Training batch: [######################################............] 574/750 mopt epoch_counter : 575
    Train Epoch 574: operator losses : 0.4274
    Training batch: [######################################............] 575/750 mopt epoch_counter : 576
    Train Epoch 575: operator losses : 0.3155
    Training batch: [######################################............] 576/750 mopt epoch_counter : 577
    Train Epoch 576: operator losses : 0.2048
    Training batch: [######################################............] 577/750 mopt epoch_counter : 578
    Train Epoch 577: operator losses : 0.4526
    Training batch: [######################################............] 578/750 mopt epoch_counter : 579
    Train Epoch 578: operator losses : 0.2927
    Training batch: [######################################............] 579/750 mopt epoch_counter : 580
    Train Epoch 579: operator losses : 0.1738
    Training batch: [######################################............] 580/750 mopt epoch_counter : 581
    Train Epoch 580: operator losses : 0.9051
    Training batch: [######################################............] 581/750 mopt epoch_counter : 582
    Train Epoch 581: operator losses : 0.3776
    Training batch: [######################################............] 582/750 mopt epoch_counter : 583
    Train Epoch 582: operator losses : 0.3190
    Training batch: [######################################............] 583/750 mopt epoch_counter : 584
    Train Epoch 583: operator losses : 0.3949
    Training batch: [######################################............] 584/750 mopt epoch_counter : 585
    Train Epoch 584: operator losses : 0.4461
    Training batch: [#######################################...........] 585/750 mopt epoch_counter : 586
    Train Epoch 585: operator losses : 0.3221
    Training batch: [#######################################...........] 586/750 mopt epoch_counter : 587
    Train Epoch 586: operator losses : 0.4659
    Training batch: [#######################################...........] 587/750 mopt epoch_counter : 588
    Train Epoch 587: operator losses : 0.3161
    Training batch: [#######################################...........] 588/750 mopt epoch_counter : 589
    Train Epoch 588: operator losses : 0.3758
    Training batch: [#######################################...........] 589/750 mopt epoch_counter : 590
    Train Epoch 589: operator losses : 0.3791
    Training batch: [#######################################...........] 590/750 mopt epoch_counter : 591
    Train Epoch 590: operator losses : 0.2237
    Training batch: [#######################################...........] 591/750 mopt epoch_counter : 592
    Train Epoch 591: operator losses : 0.1152
    Training batch: [#######################################...........] 592/750 mopt epoch_counter : 593
    Train Epoch 592: operator losses : 0.3155
    Training batch: [#######################################...........] 593/750 mopt epoch_counter : 594
    Train Epoch 593: operator losses : 0.3979
    Training batch: [#######################################...........] 594/750 mopt epoch_counter : 595
    Train Epoch 594: operator losses : 0.3212
    Training batch: [#######################################...........] 595/750 mopt epoch_counter : 596
    Train Epoch 595: operator losses : 0.6500
    Training batch: [#######################################...........] 596/750 mopt epoch_counter : 597
    Train Epoch 596: operator losses : 0.3081
    Training batch: [#######################################...........] 597/750 mopt epoch_counter : 598
    Train Epoch 597: operator losses : 0.3484
    Training batch: [#######################################...........] 598/750 mopt epoch_counter : 599
    Train Epoch 598: operator losses : 0.3235
    Training batch: [#######################################...........] 599/750 mopt epoch_counter : 600
    Train Epoch 599: operator losses : 0.4706
    Training batch: [########################################..........] 600/750 mopt epoch_counter : 601
    Train Epoch 600: operator losses : 0.2508
    Training batch: [########################################..........] 601/750 mopt epoch_counter : 602
    Train Epoch 601: operator losses : 0.3220
    Training batch: [########################################..........] 602/750 mopt epoch_counter : 603
    Train Epoch 602: operator losses : 0.3298
    Training batch: [########################################..........] 603/750 mopt epoch_counter : 604
    Train Epoch 603: operator losses : 0.1379
    Training batch: [########################################..........] 604/750 mopt epoch_counter : 605
    Train Epoch 604: operator losses : 0.4362
    Training batch: [########################################..........] 605/750 mopt epoch_counter : 606
    Train Epoch 605: operator losses : 0.2865
    Training batch: [########################################..........] 606/750 mopt epoch_counter : 607
    Train Epoch 606: operator losses : 0.2953
    Training batch: [########################################..........] 607/750 mopt epoch_counter : 608
    Train Epoch 607: operator losses : 0.3743
    Training batch: [########################################..........] 608/750 mopt epoch_counter : 609
    Train Epoch 608: operator losses : 0.4262
    Training batch: [########################################..........] 609/750 mopt epoch_counter : 610
    Train Epoch 609: operator losses : 0.4865
    Training batch: [########################################..........] 610/750 mopt epoch_counter : 611
    Train Epoch 610: operator losses : 0.1999
    Training batch: [########################################..........] 611/750 mopt epoch_counter : 612
    Train Epoch 611: operator losses : 0.3330
    Training batch: [########################################..........] 612/750 mopt epoch_counter : 613
    Train Epoch 612: operator losses : 0.3579
    Training batch: [########################################..........] 613/750 mopt epoch_counter : 614
    Train Epoch 613: operator losses : 0.2815
    Training batch: [########################################..........] 614/750 mopt epoch_counter : 615
    Train Epoch 614: operator losses : 0.5975
    Training batch: [#########################################.........] 615/750 mopt epoch_counter : 616
    Train Epoch 615: operator losses : 0.3628
    Training batch: [#########################################.........] 616/750 mopt epoch_counter : 617
    Train Epoch 616: operator losses : 0.3069
    Training batch: [#########################################.........] 617/750 mopt epoch_counter : 618
    Train Epoch 617: operator losses : 0.1908
    Training batch: [#########################################.........] 618/750 mopt epoch_counter : 619
    Train Epoch 618: operator losses : 0.4000
    Training batch: [#########################################.........] 619/750 mopt epoch_counter : 620
    Train Epoch 619: operator losses : 0.2912
    Training batch: [#########################################.........] 620/750 mopt epoch_counter : 621
    Train Epoch 620: operator losses : 0.3974
    Training batch: [#########################################.........] 621/750 mopt epoch_counter : 622
    Train Epoch 621: operator losses : 0.4709
    Training batch: [#########################################.........] 622/750 mopt epoch_counter : 623
    Train Epoch 622: operator losses : 0.4089
    Training batch: [#########################################.........] 623/750 mopt epoch_counter : 624
    Train Epoch 623: operator losses : 0.2573
    Training batch: [#########################################.........] 624/750 mopt epoch_counter : 625
    Train Epoch 624: operator losses : 0.4314
    Training batch: [#########################################.........] 625/750 mopt epoch_counter : 626
    Train Epoch 625: operator losses : 0.5806
    Training batch: [#########################################.........] 626/750 mopt epoch_counter : 627
    Train Epoch 626: operator losses : 0.4671
    Training batch: [#########################################.........] 627/750 mopt epoch_counter : 628
    Train Epoch 627: operator losses : 0.3322
    Training batch: [#########################################.........] 628/750 mopt epoch_counter : 629
    Train Epoch 628: operator losses : 0.2768
    Training batch: [#########################################.........] 629/750 mopt epoch_counter : 630
    Train Epoch 629: operator losses : 0.5061
    Training batch: [##########################################........] 630/750 mopt epoch_counter : 631
    Train Epoch 630: operator losses : 0.5693
    Training batch: [##########################################........] 631/750 mopt epoch_counter : 632
    Train Epoch 631: operator losses : 0.3190
    Training batch: [##########################################........] 632/750 mopt epoch_counter : 633
    Train Epoch 632: operator losses : 0.4887
    Training batch: [##########################################........] 633/750 mopt epoch_counter : 634
    Train Epoch 633: operator losses : 0.3029
    Training batch: [##########################################........] 634/750 mopt epoch_counter : 635
    Train Epoch 634: operator losses : 0.4508
    Training batch: [##########################################........] 635/750 mopt epoch_counter : 636
    Train Epoch 635: operator losses : 0.5573
    Training batch: [##########################################........] 636/750 mopt epoch_counter : 637
    Train Epoch 636: operator losses : 0.5404
    Training batch: [##########################################........] 637/750 mopt epoch_counter : 638
    Train Epoch 637: operator losses : 0.5474
    Training batch: [##########################################........] 638/750 mopt epoch_counter : 639
    Train Epoch 638: operator losses : 0.5803
    Training batch: [##########################################........] 639/750 mopt epoch_counter : 640
    Train Epoch 639: operator losses : 0.4477
    Training batch: [##########################################........] 640/750 mopt epoch_counter : 641
    Train Epoch 640: operator losses : 0.3718
    Training batch: [##########################################........] 641/750 mopt epoch_counter : 642
    Train Epoch 641: operator losses : 0.2502
    Training batch: [##########################################........] 642/750 mopt epoch_counter : 643
    Train Epoch 642: operator losses : 0.5551
    Training batch: [##########################################........] 643/750 mopt epoch_counter : 644
    Train Epoch 643: operator losses : 0.2891
    Training batch: [##########################################........] 644/750 mopt epoch_counter : 645
    Train Epoch 644: operator losses : 0.3610
    Training batch: [###########################################.......] 645/750 mopt epoch_counter : 646
    Train Epoch 645: operator losses : 0.4202
    Training batch: [###########################################.......] 646/750 mopt epoch_counter : 647
    Train Epoch 646: operator losses : 0.4089
    Training batch: [###########################################.......] 647/750 mopt epoch_counter : 648
    Train Epoch 647: operator losses : 0.2773
    Training batch: [###########################################.......] 648/750 mopt epoch_counter : 649
    Train Epoch 648: operator losses : 0.7258
    Training batch: [###########################################.......] 649/750 mopt epoch_counter : 650
    Train Epoch 649: operator losses : 0.3707
    Training batch: [###########################################.......] 650/750 mopt epoch_counter : 651
    Train Epoch 650: operator losses : 0.5089
    Training batch: [###########################################.......] 651/750 mopt epoch_counter : 652
    Train Epoch 651: operator losses : 0.4510
    Training batch: [###########################################.......] 652/750 mopt epoch_counter : 653
    Train Epoch 652: operator losses : 0.3132
    Training batch: [###########################################.......] 653/750 mopt epoch_counter : 654
    Train Epoch 653: operator losses : 0.4402
    Training batch: [###########################################.......] 654/750 mopt epoch_counter : 655
    Train Epoch 654: operator losses : 0.3359
    Training batch: [###########################################.......] 655/750 mopt epoch_counter : 656
    Train Epoch 655: operator losses : 0.5650
    Training batch: [###########################################.......] 656/750 mopt epoch_counter : 657
    Train Epoch 656: operator losses : 0.3791
    Training batch: [###########################################.......] 657/750 mopt epoch_counter : 658
    Train Epoch 657: operator losses : 0.5091
    Training batch: [###########################################.......] 658/750 mopt epoch_counter : 659
    Train Epoch 658: operator losses : 0.5202
    Training batch: [###########################################.......] 659/750 mopt epoch_counter : 660
    Train Epoch 659: operator losses : 0.3044
    Training batch: [############################################......] 660/750 mopt epoch_counter : 661
    Train Epoch 660: operator losses : 0.3779
    Training batch: [############################################......] 661/750 mopt epoch_counter : 662
    Train Epoch 661: operator losses : 0.3601
    Training batch: [############################################......] 662/750 mopt epoch_counter : 663
    Train Epoch 662: operator losses : 0.3634
    Training batch: [############################################......] 663/750 mopt epoch_counter : 664
    Train Epoch 663: operator losses : 0.5654
    Training batch: [############################################......] 664/750 mopt epoch_counter : 665
    Train Epoch 664: operator losses : 0.6536
    Training batch: [############################################......] 665/750 mopt epoch_counter : 666
    Train Epoch 665: operator losses : 0.3721
    Training batch: [############################################......] 666/750 mopt epoch_counter : 667
    Train Epoch 666: operator losses : 0.3891
    Training batch: [############################################......] 667/750 mopt epoch_counter : 668
    Train Epoch 667: operator losses : 0.3784
    Training batch: [############################################......] 668/750 mopt epoch_counter : 669
    Train Epoch 668: operator losses : 0.3352
    Training batch: [############################################......] 669/750 mopt epoch_counter : 670
    Train Epoch 669: operator losses : 0.5498
    Training batch: [############################################......] 670/750 mopt epoch_counter : 671
    Train Epoch 670: operator losses : 0.4399
    Training batch: [############################################......] 671/750 mopt epoch_counter : 672
    Train Epoch 671: operator losses : 0.4318
    Training batch: [############################################......] 672/750 mopt epoch_counter : 673
    Train Epoch 672: operator losses : 0.5225
    Training batch: [############################################......] 673/750 mopt epoch_counter : 674
    Train Epoch 673: operator losses : 0.3012
    Training batch: [############################################......] 674/750 mopt epoch_counter : 675
    Train Epoch 674: operator losses : 0.2189
    Training batch: [#############################################.....] 675/750 mopt epoch_counter : 676
    Train Epoch 675: operator losses : 0.4009
    Training batch: [#############################################.....] 676/750 mopt epoch_counter : 677
    Train Epoch 676: operator losses : 0.2069
    Training batch: [#############################################.....] 677/750 mopt epoch_counter : 678
    Train Epoch 677: operator losses : 0.2632
    Training batch: [#############################################.....] 678/750 mopt epoch_counter : 679
    Train Epoch 678: operator losses : 0.1979
    Training batch: [#############################################.....] 679/750 mopt epoch_counter : 680
    Train Epoch 679: operator losses : 0.2890
    Training batch: [#############################################.....] 680/750 mopt epoch_counter : 681
    Train Epoch 680: operator losses : 0.3168
    Training batch: [#############################################.....] 681/750 mopt epoch_counter : 682
    Train Epoch 681: operator losses : 0.3549
    Training batch: [#############################################.....] 682/750 mopt epoch_counter : 683
    Train Epoch 682: operator losses : 0.5867
    Training batch: [#############################################.....] 683/750 mopt epoch_counter : 684
    Train Epoch 683: operator losses : 0.5069
    Training batch: [#############################################.....] 684/750 mopt epoch_counter : 685
    Train Epoch 684: operator losses : 0.4701
    Training batch: [#############################################.....] 685/750 mopt epoch_counter : 686
    Train Epoch 685: operator losses : 0.3843
    Training batch: [#############################################.....] 686/750 mopt epoch_counter : 687
    Train Epoch 686: operator losses : 0.3529
    Training batch: [#############################################.....] 687/750 mopt epoch_counter : 688
    Train Epoch 687: operator losses : 0.3107
    Training batch: [#############################################.....] 688/750 mopt epoch_counter : 689
    Train Epoch 688: operator losses : 0.2810
    Training batch: [#############################################.....] 689/750 mopt epoch_counter : 690
    Train Epoch 689: operator losses : 0.1984
    Training batch: [##############################################....] 690/750 mopt epoch_counter : 691
    Train Epoch 690: operator losses : 0.4345
    Training batch: [##############################################....] 691/750 mopt epoch_counter : 692
    Train Epoch 691: operator losses : 0.2486
    Training batch: [##############################################....] 692/750 mopt epoch_counter : 693
    Train Epoch 692: operator losses : 0.3306
    Training batch: [##############################################....] 693/750 mopt epoch_counter : 694
    Train Epoch 693: operator losses : 0.2765
    Training batch: [##############################################....] 694/750 mopt epoch_counter : 695
    Train Epoch 694: operator losses : 0.3727
    Training batch: [##############################################....] 695/750 mopt epoch_counter : 696
    Train Epoch 695: operator losses : 0.4105
    Training batch: [##############################################....] 696/750 mopt epoch_counter : 697
    Train Epoch 696: operator losses : 0.6961
    Training batch: [##############################################....] 697/750 mopt epoch_counter : 698
    Train Epoch 697: operator losses : 0.5510
    Training batch: [##############################################....] 698/750 mopt epoch_counter : 699
    Train Epoch 698: operator losses : 0.2441
    Training batch: [##############################################....] 699/750 mopt epoch_counter : 700
    Train Epoch 699: operator losses : 0.2386
    Training batch: [##############################################....] 700/750 mopt epoch_counter : 701
    Train Epoch 700: operator losses : 0.3396
    Training batch: [##############################################....] 701/750 mopt epoch_counter : 702
    Train Epoch 701: operator losses : 0.3914
    Training batch: [##############################################....] 702/750 mopt epoch_counter : 703
    Train Epoch 702: operator losses : 0.2788
    Training batch: [##############################################....] 703/750 mopt epoch_counter : 704
    Train Epoch 703: operator losses : 0.4890
    Training batch: [##############################################....] 704/750 mopt epoch_counter : 705
    Train Epoch 704: operator losses : 0.3121
    Training batch: [###############################################...] 705/750 mopt epoch_counter : 706
    Train Epoch 705: operator losses : 0.5547
    Training batch: [###############################################...] 706/750 mopt epoch_counter : 707
    Train Epoch 706: operator losses : 0.2601
    Training batch: [###############################################...] 707/750 mopt epoch_counter : 708
    Train Epoch 707: operator losses : 0.3357
    Training batch: [###############################################...] 708/750 mopt epoch_counter : 709
    Train Epoch 708: operator losses : 0.3317
    Training batch: [###############################################...] 709/750 mopt epoch_counter : 710
    Train Epoch 709: operator losses : 0.3448
    Training batch: [###############################################...] 710/750 mopt epoch_counter : 711
    Train Epoch 710: operator losses : 0.4926
    Training batch: [###############################################...] 711/750 mopt epoch_counter : 712
    Train Epoch 711: operator losses : 0.6293
    Training batch: [###############################################...] 712/750 mopt epoch_counter : 713
    Train Epoch 712: operator losses : 0.3925
    Training batch: [###############################################...] 713/750 mopt epoch_counter : 714
    Train Epoch 713: operator losses : 0.3443
    Training batch: [###############################################...] 714/750 mopt epoch_counter : 715
    Train Epoch 714: operator losses : 0.2785
    Training batch: [###############################################...] 715/750 mopt epoch_counter : 716
    Train Epoch 715: operator losses : 0.5270
    Training batch: [###############################################...] 716/750 mopt epoch_counter : 717
    Train Epoch 716: operator losses : 0.5011
    Training batch: [###############################################...] 717/750 mopt epoch_counter : 718
    Train Epoch 717: operator losses : 0.2912
    Training batch: [###############################################...] 718/750 mopt epoch_counter : 719
    Train Epoch 718: operator losses : 0.3922
    Training batch: [###############################################...] 719/750 mopt epoch_counter : 720
    Train Epoch 719: operator losses : 0.2304
    Training batch: [################################################..] 720/750 mopt epoch_counter : 721
    Train Epoch 720: operator losses : 0.6464
    Training batch: [################################################..] 721/750 mopt epoch_counter : 722
    Train Epoch 721: operator losses : 0.3836
    Training batch: [################################################..] 722/750 mopt epoch_counter : 723
    Train Epoch 722: operator losses : 0.3686
    Training batch: [################################################..] 723/750 mopt epoch_counter : 724
    Train Epoch 723: operator losses : 0.4687
    Training batch: [################################################..] 724/750 mopt epoch_counter : 725
    Train Epoch 724: operator losses : 0.5951
    Training batch: [################################################..] 725/750 mopt epoch_counter : 726
    Train Epoch 725: operator losses : 0.3533
    Training batch: [################################################..] 726/750 mopt epoch_counter : 727
    Train Epoch 726: operator losses : 0.3568
    Training batch: [################################################..] 727/750 mopt epoch_counter : 728
    Train Epoch 727: operator losses : 0.3407
    Training batch: [################################################..] 728/750 mopt epoch_counter : 729
    Train Epoch 728: operator losses : 0.4656
    Training batch: [################################################..] 729/750 mopt epoch_counter : 730
    Train Epoch 729: operator losses : 0.3928
    Training batch: [################################################..] 730/750 mopt epoch_counter : 731
    Train Epoch 730: operator losses : 0.3239
    Training batch: [################################################..] 731/750 mopt epoch_counter : 732
    Train Epoch 731: operator losses : 0.3773
    Training batch: [################################################..] 732/750 mopt epoch_counter : 733
    Train Epoch 732: operator losses : 0.3971
    Training batch: [################################################..] 733/750 mopt epoch_counter : 734
    Train Epoch 733: operator losses : 0.5605
    Training batch: [################################################..] 734/750 mopt epoch_counter : 735
    Train Epoch 734: operator losses : 0.5520
    Training batch: [#################################################.] 735/750 mopt epoch_counter : 736
    Train Epoch 735: operator losses : 0.4912
    Training batch: [#################################################.] 736/750 mopt epoch_counter : 737
    Train Epoch 736: operator losses : 0.3181
    Training batch: [#################################################.] 737/750 mopt epoch_counter : 738
    Train Epoch 737: operator losses : 0.6711
    Training batch: [#################################################.] 738/750 mopt epoch_counter : 739
    Train Epoch 738: operator losses : 0.4034
    Training batch: [#################################################.] 739/750 mopt epoch_counter : 740
    Train Epoch 739: operator losses : 0.4188
    Training batch: [#################################################.] 740/750 mopt epoch_counter : 741
    Train Epoch 740: operator losses : 0.2891
    Training batch: [#################################################.] 741/750 mopt epoch_counter : 742
    Train Epoch 741: operator losses : 0.3329
    Training batch: [#################################################.] 742/750 mopt epoch_counter : 743
    Train Epoch 742: operator losses : 0.3347
    Training batch: [#################################################.] 743/750 mopt epoch_counter : 744
    Train Epoch 743: operator losses : 0.4183
    Training batch: [#################################################.] 744/750 mopt epoch_counter : 745
    Train Epoch 744: operator losses : 0.4607
    Training batch: [#################################################.] 745/750 mopt epoch_counter : 746
    Train Epoch 745: operator losses : 0.3076
    Training batch: [#################################################.] 746/750 mopt epoch_counter : 747
    Train Epoch 746: operator losses : 0.3570
    Training batch: [#################################################.] 747/750 mopt epoch_counter : 748
    Train Epoch 747: operator losses : 0.2381
    Training batch: [#################################################.] 748/750 mopt epoch_counter : 749
    Train Epoch 748: operator losses : 0.7071
    Training batch: [#################################################.] 749/750 mopt epoch_counter : 750
    Train Epoch 749: operator losses : 0.3527
    Training batch: [##################################################] 750/750 
    FeatureSelector.train_networks_on_data end=============
    Training Time : 116.266
    FeatureSelector.get_importances start=============
    FeatureSelector.get_importances end=============
    Importances:  [-1.35601265e-04 -1.89684579e-04 -1.12234280e-04 -1.57050628e-04
     -4.87793695e-05 -9.42096449e-06  3.95674069e-05 -5.45686380e-05
      6.73778486e-05 -1.57727423e-04 -8.69021460e-05 -7.24262936e-05
     -1.76045869e-04 -5.84084191e-05  7.71154664e-05 -1.69446837e-04
     -7.68252212e-05 -1.55767062e-04 -1.10801091e-04 -1.08170701e-04
     -5.34530955e-06 -1.88689621e-04 -8.49246280e-05 -1.21254612e-04
      6.35886681e-05 -6.25879620e-05 -9.45531137e-05 -5.28027158e-05
     -7.90567719e-05 -6.48953937e-05 -1.05163948e-04 -1.33071808e-04
      5.00696806e-05 -2.74746581e-05 -1.44836144e-04 -4.43730642e-05
      6.92673275e-05 -1.01410864e-04  8.32427904e-05 -1.11390204e-04
      2.72541929e-05 -1.20866549e-04 -7.50299005e-05  1.99365445e-06
     -4.30650944e-05  9.10181334e-05 -7.81334384e-05  6.76166383e-05
     -3.51907620e-05 -1.14001399e-04 -1.15019669e-04 -5.23323142e-05
     -1.22827660e-05 -7.49239771e-05 -2.05970514e-06 -2.45833985e-06
     -1.25705003e-04  1.22486337e-04 -1.45103390e-04 -1.24117032e-05
     -7.75637034e-07 -9.79814649e-05  3.11019321e-05 -1.03850529e-04
     -6.38017664e-05  2.01862640e-05 -1.49968211e-04  6.62118182e-05
     -1.31208013e-04 -1.83875636e-05  2.55896721e-05  1.18354568e-04
      8.59297797e-05  6.03253029e-05 -9.35978969e-05  9.80056393e-06
     -1.75902678e-04 -5.22700866e-05 -7.53463755e-05 -3.00468655e-05
      9.67117376e-05 -1.37418669e-04 -1.18469528e-04  3.91078429e-05
     -9.99089098e-05 -3.06724287e-05  7.87497484e-05 -1.15895287e-04
      6.34781245e-05  4.34700451e-06 -4.43711615e-05  7.57734451e-05
      5.10101308e-05  2.07501944e-05 -9.60452780e-06  6.30242503e-05
     -1.09596942e-04  7.46610967e-05  5.13304221e-05 -1.69024861e-04
      3.26144327e-05 -2.04247888e-04 -9.59180543e-05  4.51342567e-05
      2.74224330e-05 -1.54326670e-04 -1.35311668e-04 -8.42934460e-05
     -1.39752112e-04 -1.63426914e-04  2.71288500e-05 -1.35378170e-04
      5.08414341e-05  7.32167027e-05 -2.36098895e-05  9.46164582e-05
     -1.29453445e-04  6.77710250e-06  5.72814934e-05  4.51057203e-05
      1.97651457e-06 -1.68070852e-04 -1.45806102e-04 -1.21144927e-04
     -1.57066199e-04 -2.23683473e-05  4.55285699e-05  1.94282638e-05
      5.28273486e-05  5.85149901e-05 -1.36702918e-04  2.97555016e-05
      9.35994904e-05 -1.53560643e-04  1.98756115e-05 -1.00283964e-04
     -1.07179359e-04  1.50592523e-05  5.40304536e-05 -6.83212638e-05
      8.78373794e-06  9.44856438e-05  1.68116367e-05 -1.14270828e-04
     -1.55162226e-04  2.00972663e-05 -2.05105080e-05  4.18284544e-05
      5.59034779e-05 -9.93978101e-05 -7.57743692e-05  6.08144255e-05
     -7.66612065e-05 -7.16211289e-05 -1.99681139e-07 -3.43296233e-05
      1.51407648e-05]
    Optimal_subset:  (array([  5,   6,   8,  14,  20,  24,  32,  33,  36,  38,  40,  43,  44,
            45,  47,  48,  52,  54,  55,  57,  59,  60,  62,  65,  67,  69,
            70,  71,  72,  73,  75,  79,  80,  83,  85,  86,  88,  89,  91,
            92,  93,  94,  95,  97,  98, 100, 103, 104, 110, 112, 113, 114,
           115, 117, 118, 119, 120, 125, 126, 127, 128, 129, 131, 132, 134,
           137, 138, 140, 141, 142, 145, 146, 147, 148, 151, 154, 155, 156]),)
    Test performance (CE):  0.3657189905643463
    Test performance (AUC):  0.7717195153236389
    Test performance (ACC): 0.822662353515625
    Test performance (precision): 0.6215420961380005
    Test performance (recall): 0.6734693646430969
    CPU times: user 1min 54s, sys: 3.22 s, total: 1min 58s
    Wall time: 1min 58s
    
